'use server'

import { prisma } from '@/lib/db'
import { EmployeeSchema, type EmployeeInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getEmployees(search?: string) {
  return prisma.employee.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { lastName: 'asc' },
    include: {
      department: true,
      location: true,
      _count: { select: { assignments: true } },
    },
  })
}

export async function getEmployee(id: number) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      location: true,
      assignments: {
        include: { asset: { include: { category: true } } },
        orderBy: { assignedDate: 'desc' },
      },
    },
  })
}

export async function createEmployee(data: EmployeeInput) {
  const validated = EmployeeSchema.parse(data)
  const employee = await prisma.employee.create({
    data: {
      ...validated,
      departmentId: validated.departmentId || null,
      locationId: validated.locationId || null,
    },
  })
  revalidatePath('/employees')
  return employee
}

export async function updateEmployee(id: number, data: EmployeeInput) {
  const validated = EmployeeSchema.parse(data)
  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...validated,
      departmentId: validated.departmentId || null,
      locationId: validated.locationId || null,
    },
  })
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  return employee
}

export async function deleteEmployee(id: number) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { _count: { select: { assignments: true } } }
  })

  if (!employee) return { error: 'Employee not found.' }

  if (employee._count.assignments > 0) {
    return { error: `Cannot delete employee "${employee.firstName} ${employee.lastName}" because they have assigned assets.` }
  }

  await prisma.employee.delete({ where: { id } })
  revalidatePath('/employees')
  return { success: true }
}

export async function deleteEmployees(ids: number[]) {
  const employeesInUse = await prisma.employee.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { assignments: true } } }
  })

  const inUseNames = employeesInUse
    .filter(e => e._count.assignments > 0)
    .map(e => `${e.firstName} ${e.lastName}`)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following employees because they have assignments: ${inUseNames.join(', ')}` }
  }

  await prisma.employee.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/employees')
  return { success: true }
}

export async function importEmployeesCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.firstName || !row.lastName || !row.email) continue
    validData.push({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      jobTitle: row.jobTitle || null,
      status: row.status || 'Active',
      employeeId: row.employeeId || null,
      phoneNumber: row.phoneNumber || null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found (requires firstName, lastName, email).' }

  try {
    const result = await prisma.employee.createMany({
      data: validData as any,
      skipDuplicates: true, // skips if email or employeeId conflict
    })
    revalidatePath('/employees')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
