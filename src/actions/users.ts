'use server'

import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await verifySession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function getUsers() {
  await checkAdmin()
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      ntid: true,
      name: true,
      role: true,
      createdAt: true,
    }
  })
}

export async function createUser(data: FormData) {
  await checkAdmin()
  const email = data.get('email') as string
  const ntid = (data.get('ntid') as string) || null
  const name = data.get('name') as string
  const role = data.get('role') as string
  const password = data.get('password') as string

  if (!email || !password) throw new Error('Email and password required')

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      ntid,
      name,
      role,
      passwordHash,
    }
  })
  
  revalidatePath('/admin/users')
}

export async function updateUser(data: FormData) {
  await checkAdmin()
  const id = parseInt(data.get('id') as string)
  const email = data.get('email') as string
  const ntid = (data.get('ntid') as string) || null
  const name = data.get('name') as string
  const role = data.get('role') as string
  const password = data.get('password') as string

  if (!email) throw new Error('Email required')

  const updateData: any = {
    email,
    ntid,
    name,
    role,
  }

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  })
  
  revalidatePath('/admin/users')
}

export async function deleteUser(id: number) {
  await checkAdmin()
  
  await prisma.user.delete({
    where: { id },
  })
  
  revalidatePath('/admin/users')
}
