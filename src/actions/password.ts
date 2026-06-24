'use server'

import { prisma } from '@/lib/db'
import { verifySession, updateSession, createSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function changePassword(formData: FormData) {
  const session = await verifySession()
  if (!session?.userId) {
    return { error: 'Unauthorized' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }

  // Complexity rules
  if (newPassword.length < 12) {
    return { error: 'Password must be at least 12 characters long.' }
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { error: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[a-z]/.test(newPassword)) {
    return { error: 'Password must contain at least one lowercase letter.' }
  }
  if (!/[0-9]/.test(newPassword)) {
    return { error: 'Password must contain at least one number.' }
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return { error: 'Password must contain at least one special character.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      passwordHistory: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  if (!user) {
    return { error: 'User not found.' }
  }

  // Verify current password
  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isCurrentValid) {
    return { error: 'Invalid current password.' }
  }

  // Check history (last 3 times)
  for (const history of user.passwordHistory) {
    const isReused = await bcrypt.compare(newPassword, history.passwordHash)
    if (isReused) {
      return { error: 'Password cannot be the same as any of your last 3 passwords.' }
    }
  }

  // Also check if new password is the SAME as the current one
  const isSameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash)
  if (isSameAsCurrent) {
    return { error: 'New password cannot be the same as the current password.' }
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10)

  // Transaction: Update user, insert history, keep only 3 latest histories
  await prisma.$transaction(async (tx) => {
    // Save current password to history
    await tx.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: user.passwordHash
      }
    })

    // Update user
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date()
      }
    })

    // Cleanup old histories (keep only newest 3)
    const histories = await tx.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: 3,
      select: { id: true }
    })
    
    if (histories.length > 0) {
      await tx.passwordHistory.deleteMany({
        where: {
          id: { in: histories.map(h => h.id) }
        }
      })
    }
  })

  // Refresh session to clear passwordExpired flag
  await createSession(user.id, user.email, user.role, false)

  return { success: true }
}
