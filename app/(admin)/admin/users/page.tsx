// 📄 PAGE: Admin Manage Users
// 🌐 URL: /admin/users
// 👤 WHO: Admin only

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db'
import User from '@/models/User'
import AdminUsersList from '@/components/dashboard/AdminUsersList'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  await connectDB()

  // Fetch all users sorted by registration date
  const rawUsers = await User.find()
    .sort({ createdAt: -1 })
    .lean()

  // Serialize Mongoose models for Next.js Client Component compatibility
  const users = rawUsers.map(user => ({
    _id: user._id.toString(),
    name: user.name || 'Unknown',
    email: user.email,
    role: user.role || 'jobseeker',
    isEmailVerified: !!user.isEmailVerified,
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Manage Platform Users</h1>
        <p className="text-xs text-muted">
          {users.length} registered accounts across seekers, recruiters, and administrators
        </p>
      </div>

      <AdminUsersList initialUsers={users} currentUserId={session.user.id} />
    </div>
  )
}
