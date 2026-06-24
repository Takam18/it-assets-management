'use server'

import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Identifier and password are required' }
  }

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { ntid: identifier },
      ],
    },
  })

  if (!user) {
    return { error: 'Invalid credentials' }
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash)

  if (!isValid) {
    return { error: 'Invalid credentials' }
  }

  // Check if password has expired (90 days)
  const lastChanged = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : 0
  const passwordAgeDays = (Date.now() - lastChanged) / (1000 * 60 * 60 * 24)
  const passwordExpired = passwordAgeDays >= 90

  // Create session
  await createSession(user.id, user.email, user.role, passwordExpired)

  return { success: true, redirect: passwordExpired ? '/change-password' : '/' }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
