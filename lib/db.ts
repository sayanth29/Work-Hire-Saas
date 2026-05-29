import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not found in .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

/**
 * Resolves a mongodb+srv connection string to a standard replica set connection string
 * using DNS-over-HTTPS (DoH). This bypasses the Node.js DNS/worker thread resolution issues
 * commonly found on Windows/WSL/local development networks.
 */
async function resolveSrvToReplicaSet(uri: string): Promise<string> {
  const parsed = new URL(uri)
  const username = decodeURIComponent(parsed.username)
  const password = decodeURIComponent(parsed.password)
  const host = parsed.host
  const database = parsed.pathname.slice(1) // Remove leading slash
  const options = parsed.search.slice(1) // Remove leading question mark

  const srvUrl = `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`
  const txtUrl = `https://cloudflare-dns.com/dns-query?name=${host}&type=TXT`

  const [srvRes, txtRes] = await Promise.all([
    fetch(srvUrl, { headers: { accept: 'application/dns-json' } }),
    fetch(txtUrl, { headers: { accept: 'application/dns-json' } }),
  ])

  const srvData = await srvRes.json()
  const txtData = await txtRes.json()

  if (!srvData.Answer || srvData.Answer.length === 0) {
    throw new Error('No SRV records found')
  }

  const hosts = srvData.Answer.map((ans: any) => {
    const parts = ans.data.split(' ')
    const port = parts[2]
    let target = parts[3]
    if (target.endsWith('.')) target = target.slice(0, -1)
    return `${target}:${port}`
  }).join(',')

  let txtOptions = ''
  if (txtData.Answer && txtData.Answer.length > 0) {
    txtOptions = txtData.Answer[0].data.replace(/"/g, '')
  }

  const allOptions = [
    'ssl=true',
    txtOptions,
    options
  ].filter(Boolean).join('&')

  const encodedUser = encodeURIComponent(username)
  const encodedPass = encodeURIComponent(password)

  return `mongodb://${encodedUser}:${encodedPass}@${hosts}/${database}?${allOptions}`
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = (async () => {
      let uri = MONGODB_URI
      try {
        return await mongoose.connect(uri, {
          bufferCommands: false,
        })
      } catch (err: any) {
        if (uri.startsWith('mongodb+srv://') && (err.message?.includes('querySrv') || err.code === 'ECONNREFUSED')) {
          console.warn('⚠️ MongoDB connection failed due to querySrv/DNS issue. Attempting DNS-over-HTTPS self-healing fallback...')
          try {
            const fallbackUri = await resolveSrvToReplicaSet(uri)
            return await mongoose.connect(fallbackUri, {
              bufferCommands: false,
            })
          } catch (fallbackErr: any) {
            console.error('❌ Fallback connection failed:', fallbackErr.message)
            throw err // Throw the original error if fallback also fails
          }
        }
        throw err
      }
    })()
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB