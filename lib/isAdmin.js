export function isAdmin(user) {
  if (!user) return false
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
  return adminEmails.includes(user.email?.toLowerCase())
}