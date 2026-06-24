'use server'

import { prisma } from '@/lib/db'
import { AssignmentSchema, ReturnSchema, type AssignmentInput, type ReturnInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getAssignments(activeOnly?: boolean) {
  return prisma.assetAssignment.findMany({
    where: activeOnly ? { actualReturnDate: null } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: { include: { category: true } },
      employee: { include: { department: true } },
    },
  })
}

export async function getAssignment(id: number) {
  return prisma.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: { include: { category: true, vendor: true } },
      employee: { include: { department: true, location: true } },
    },
  })
}

export async function createAssignment(data: AssignmentInput) {
  const validated = AssignmentSchema.parse(data)

  // Check if asset is available
  const asset = await prisma.asset.findUnique({ where: { computerName: validated.assetId } })
  if (!asset) throw new Error('Asset not found')
  if (asset.status !== 'In Stock') throw new Error('Asset is not available for assignment')

  const assignment = await prisma.$transaction(async (tx) => {
    // Create the assignment
    const newAssignment = await tx.assetAssignment.create({
      data: {
        assetId: validated.assetId,
        employeeId: validated.employeeId,
        assignedDate: new Date(validated.assignedDate),
        expectedReturnDate: validated.expectedReturnDate ? new Date(validated.expectedReturnDate) : null,
        checkOutCondition: validated.checkOutCondition || null,
        assignedBy: validated.assignedBy || null,
      },
    })

    // Update asset status to Assigned
    await tx.asset.update({
      where: { computerName: validated.assetId },
      data: { status: 'Assigned' },
    })

    return newAssignment
  })

  revalidatePath('/assignments')
  revalidatePath('/assets')
  revalidatePath('/')
  return assignment
}

export async function returnAsset(assignmentId: number, data: ReturnInput) {
  const validated = ReturnSchema.parse(data)

  const assignment = await prisma.assetAssignment.findUnique({
    where: { id: assignmentId },
  })
  if (!assignment) throw new Error('Assignment not found')
  if (assignment.actualReturnDate) throw new Error('Asset has already been returned')

  const updated = await prisma.$transaction(async (tx) => {
    // Update assignment with return info
    const updatedAssignment = await tx.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        actualReturnDate: new Date(validated.actualReturnDate),
        checkInCondition: validated.checkInCondition || null,
      },
    })

    // Update asset status back to Available
    await tx.asset.update({
      where: { computerName: assignment.assetId },
      data: { status: 'In Stock' },
    })

    return updatedAssignment
  })

  revalidatePath('/assignments')
  revalidatePath('/assets')
  revalidatePath('/')
  return updated
}

export async function deleteAssignment(id: number) {
  const assignment = await prisma.assetAssignment.findUnique({ where: { id } })
  if (!assignment) return { error: 'Assignment not found.' }

  await prisma.$transaction(async (tx) => {
    // If it was active, reset asset status to In Stock
    if (!assignment.actualReturnDate) {
      await tx.asset.update({
        where: { computerName: assignment.assetId },
        data: { status: 'In Stock' }
      })
    }
    await tx.assetAssignment.delete({ where: { id } })
  })

  revalidatePath('/assignments')
  revalidatePath('/assets')
  return { success: true }
}

export async function deleteAssignments(ids: number[]) {
  const assignments = await prisma.assetAssignment.findMany({ where: { id: { in: ids } } })
  
  await prisma.$transaction(async (tx) => {
    for (const assignment of assignments) {
      if (!assignment.actualReturnDate) {
        await tx.asset.update({
          where: { computerName: assignment.assetId },
          data: { status: 'In Stock' }
        })
      }
    }
    await tx.assetAssignment.deleteMany({ where: { id: { in: ids } } })
  })

  revalidatePath('/assignments')
  revalidatePath('/assets')
  return { success: true }
}
