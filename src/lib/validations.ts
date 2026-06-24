import { z } from 'zod'

// ─── Enums ──────────────────────────────────────────────

export const EmployeeStatusEnum = z.enum(['Active', 'Terminated', 'OnLeave'])
export const AssetStatusEnum = z.enum(['In Stock', 'Assigned', 'InRepair', 'LostStolen', 'Retired'])
export const ServiceTypeEnum = z.enum(['Repair', 'Upgrade', 'RoutineMaintenance', 'Audit'])

// ─── Location ───────────────────────────────────────────

export const LocationSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
})

export type LocationInput = z.infer<typeof LocationSchema>

// ─── Department ─────────────────────────────────────────

export const DepartmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required').max(100),
  managerId: z.coerce.number().int().positive().optional().nullable(),
})

export type DepartmentInput = z.infer<typeof DepartmentSchema>

// ─── Area ───────────────────────────────────────────────

export const AreaSchema = z.object({
  building: z.string().min(1, 'Building is required').max(100),
  room: z.string().min(1, 'Room is required').max(100),
  location: z.string().min(1, 'Location is required').max(100),
  remark: z.string().max(255).optional().or(z.literal('')),
})

export type AreaInput = z.infer<typeof AreaSchema>

// ─── Employee ───────────────────────────────────────────

export const EmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address').max(100),
  employeeId: z.string().max(50).optional().nullable().or(z.literal('')),
  departmentId: z.coerce.number().int().positive().optional().nullable(),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  status: EmployeeStatusEnum.default('Active'),
})

export type EmployeeInput = z.infer<typeof EmployeeSchema>

// ─── Vendor ─────────────────────────────────────────────

export const VendorSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required').max(100),
  contactName: z.string().max(100).optional().or(z.literal('')),
  contactEmail: z.string().email().max(100).optional().or(z.literal('')),
  supportPhone: z.string().max(50).optional().or(z.literal('')),
})

export type VendorInput = z.infer<typeof VendorSchema>

// ─── Asset Category ─────────────────────────────────────

export const AssetCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional().or(z.literal('')),
  parentId: z.coerce.number().int().positive().optional().nullable(),
  defaultPrice: z.coerce.number().min(0).optional().nullable(),
})

export type AssetCategoryInput = z.infer<typeof AssetCategorySchema>

// ─── Asset ──────────────────────────────────────────────

export const AssetSchema = z.object({
  computerName: z.string().min(1, 'Computer name is required').max(100),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  brandId: z.coerce.number().int().positive().optional().nullable(),
  vendorId: z.coerce.number().int().positive().optional().nullable(),
  model: z.string().max(100).optional().or(z.literal('')),
  assetNumber: z.string().max(100).optional().or(z.literal('')),
  purchaseOrderNo: z.string().max(100).optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  purchaseCost: z.coerce.number().min(0).optional().nullable(),
  warrantyStart: z.string().optional().or(z.literal('')),
  warrantyExpiration: z.string().optional().or(z.literal('')),
  status: AssetStatusEnum.default('In Stock'),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
  operatingSystem: z.string().max(100).nullable().optional().or(z.literal('')),
  ipAddress: z.string().max(100).nullable().optional().or(z.literal('')),
  macAddress: z.string().max(100).nullable().optional().or(z.literal('')),
  isAssetLabeled: z.boolean().default(false).optional(),
  areaId: z.coerce.number().int().positive().optional().nullable(),
})

export type AssetInput = z.infer<typeof AssetSchema>

// ─── Asset Assignment ───────────────────────────────────

export const AssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  employeeId: z.coerce.number().int().positive('Employee is required'),
  assignedDate: z.string().min(1, 'Assigned date is required'),
  expectedReturnDate: z.string().optional().or(z.literal('')),
  checkOutCondition: z.string().optional().or(z.literal('')),
  assignedBy: z.string().max(100).optional().or(z.literal('')),
})

export type AssignmentInput = z.infer<typeof AssignmentSchema>

export const ReturnSchema = z.object({
  actualReturnDate: z.string().min(1, 'Return date is required'),
  checkInCondition: z.string().optional().or(z.literal('')),
})

export type ReturnInput = z.infer<typeof ReturnSchema>

// ─── Maintenance Log ────────────────────────────────────

export const MaintenanceLogSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  serviceType: ServiceTypeEnum,
  vendorId: z.coerce.number().int().positive().optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
  description: z.string().optional().or(z.literal('')),
  performedBy: z.string().max(100).optional().or(z.literal('')),
})

export type MaintenanceLogInput = z.infer<typeof MaintenanceLogSchema>

// ─── Helper for formatting enum values for display ──────

export const formatEnumValue = (value: string): string => {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export const assetStatusOptions = [
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'InRepair', label: 'In Repair' },
  { value: 'LostStolen', label: 'Lost / Stolen' },
  { value: 'Retired', label: 'Retired' },
]

export const employeeStatusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'OnLeave', label: 'On Leave' },
]

export const serviceTypeOptions = [
  { value: 'Repair', label: 'Repair' },
  { value: 'Upgrade', label: 'Upgrade' },
  { value: 'RoutineMaintenance', label: 'Routine Maintenance' },
  { value: 'Audit', label: 'Audit' },
]
