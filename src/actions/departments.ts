'use server'

import { prisma } from '@/lib/db'
import { DepartmentSchema, type DepartmentInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { departmentName: 'asc' },
    include: {
      _count: { select: { employees: true } },
    },
  })
}

export async function getDepartment(id: number) {
  return prisma.department.findUnique({
    where: { id },
    include: { employees: true },
  })
}

export async function createDepartment(data: DepartmentInput) {
  const validated = DepartmentSchema.parse(data)
  const department = await prisma.department.create({ data: validated })
  revalidatePath('/departments')
  return department
}

export async function updateDepartment(id: number, data: DepartmentInput) {
  const validated = DepartmentSchema.parse(data)
  const department = await prisma.department.update({ where: { id }, data: validated })
  revalidatePath('/departments')
  revalidatePath(`/departments/${id}`)
  return department
}

export async function deleteDepartment(id: number) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } }
  })

  if (!department) return { error: 'Department not found.' }

  if (department._count.employees > 0) {
    return { error: `Cannot delete department "${department.departmentName}" because it has employees assigned to it.` }
  }

  await prisma.department.delete({ where: { id } })
  revalidatePath('/departments')
  return { success: true }
}

export async function deleteDepartments(ids: number[]) {
  const departmentsInUse = await prisma.department.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { employees: true } } }
  })

  const inUseNames = departmentsInUse
    .filter(d => d._count.employees > 0)
    .map(d => d.departmentName)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following departments because they are in use: ${inUseNames.join(', ')}` }
  }

  await prisma.department.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/departments')
  return { success: true }
}

export async function importDepartmentsCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.departmentName) continue
    validData.push({
      departmentName: row.departmentName,
      managerId: row.managerId ? parseInt(row.managerId) : null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found.' }

  try {
    const result = await prisma.department.createMany({
      data: validData as any,
      skipDuplicates: true,
    })
    revalidatePath('/departments')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
