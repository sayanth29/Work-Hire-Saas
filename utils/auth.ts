import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Company from '@/models/Company'

export const authOptions: NextAuthOptions = {
  providers: [

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })

        if (!user) throw new Error('No account found with this email')
        if (!user.password) throw new Error('Please login with Google')

        const isMatch = await user.comparePassword(credentials.password)
        if (!isMatch) throw new Error('Invalid password')

        if (!user.isEmailVerified) {
          if (user.role === 'recruiter') {
            const company = await Company.findOne({ ownerId: user._id })
            if (company && company.isEmailVerified) {
              user.isEmailVerified = true
              user.emailVerifyToken = undefined
              user.emailVerifyExpires = undefined
              await user.save()
            } else {
              throw new Error('Please verify your email first')
            }
          } else {
            throw new Error('Please verify your email first')
          }
        }

        return {
          id:     user._id.toString(),
          name:   user.name,
          email:  user.email,
          role:   user.role,
          avatar: user.avatar,
        }
      },
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id     = user.id
        token.role   = user.role
        token.avatar = user.avatar
      }

      // Google login → find or create user
      if (account?.provider === 'google' && token.email) {
        await connectDB()
        let dbUser = await User.findOne({ email: token.email })

        if (!dbUser) {
          dbUser = await User.create({
            name:            token.name ?? '',
            email:           token.email,
            googleId:        token.sub ?? '',
            avatar:          token.picture ?? '',
            role:            'jobseeker',
            isEmailVerified: true,
          })
        }

        token.id     = dbUser._id.toString()
        token.role   = dbUser.role
        token.avatar = dbUser.avatar
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id     = token.id
        session.user.role   = token.role
        session.user.avatar = token.avatar
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}