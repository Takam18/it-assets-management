import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.maintenanceLog.deleteMany()
  await prisma.assetAssignment.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.assetCategory.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.department.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      passwordHash: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    }
  })
  console.log(`  ✓ 1 admin user created`)

  // Locations
  const locations = await Promise.all([
    prisma.location.create({ data: { siteName: 'HQ - New York', address: '350 5th Avenue', city: 'New York', country: 'United States' } }),
    prisma.location.create({ data: { siteName: 'Branch - London', address: '10 Downing St', city: 'London', country: 'United Kingdom' } }),
    prisma.location.create({ data: { siteName: 'Remote - APAC', address: 'Virtual Office', city: 'Singapore', country: 'Singapore' } }),
  ])
  console.log(`  ✓ ${locations.length} locations`)

  // Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { departmentName: 'Engineering' } }),
    prisma.department.create({ data: { departmentName: 'Marketing' } }),
    prisma.department.create({ data: { departmentName: 'Human Resources' } }),
    prisma.department.create({ data: { departmentName: 'Finance' } }),
    prisma.department.create({ data: { departmentName: 'IT Operations' } }),
  ])
  console.log(`  ✓ ${departments.length} departments`)

  // Vendors
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { vendorName: 'Dell Technologies', contactName: 'Sarah Chen', contactEmail: 'enterprise@dell.com', supportPhone: '+1-800-999-3355' } }),
    prisma.vendor.create({ data: { vendorName: 'Apple Inc.', contactName: 'James Park', contactEmail: 'business@apple.com', supportPhone: '+1-800-275-2273' } }),
    prisma.vendor.create({ data: { vendorName: 'Lenovo', contactName: 'Michael Wu', contactEmail: 'support@lenovo.com', supportPhone: '+1-855-253-6686' } }),
    prisma.vendor.create({ data: { vendorName: 'Microsoft', contactName: 'Lisa Brown', contactEmail: 'licensing@microsoft.com', supportPhone: '+1-800-642-7676' } }),
    prisma.vendor.create({ data: { vendorName: 'Cisco Systems', contactName: 'Robert Kim', contactEmail: 'orders@cisco.com', supportPhone: '+1-800-553-6387' } }),
  ])
  console.log(`  ✓ ${vendors.length} vendors`)

  // Categories
  const catItAssets = await prisma.assetCategory.create({ data: { categoryName: 'IT Assets', description: 'Information Technology assets' } })
  const catNonItAssets = await prisma.assetCategory.create({ data: { categoryName: 'Non IT Assets', description: 'Other operational assets' } })

  const subCategories = await Promise.all([
    // IT Assets
    prisma.assetCategory.create({ data: { categoryName: 'Laptop', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Desktop', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Workstation', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Raspberry Pi', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Network Devices', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Printers', parentId: catItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'peripherals', parentId: catItAssets.id } }),
    // Non IT Assets
    prisma.assetCategory.create({ data: { categoryName: 'CNC Machines', parentId: catNonItAssets.id } }),
    prisma.assetCategory.create({ data: { categoryName: 'Software', parentId: catNonItAssets.id } }),
  ])
  
  // Create an easily accessible map for asset seeding
  const cats = {
    laptop: subCategories[0].id,
    desktop: subCategories[1].id,
    network: subCategories[4].id,
    peripherals: subCategories[6].id,
    software: subCategories[8].id,
  }
  
  console.log(`  ✓ 2 parent categories and ${subCategories.length} sub-categories created`)

  // Employees
  const employees = await Promise.all([
    prisma.employee.create({ data: { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@company.com', departmentId: departments[0].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@company.com', departmentId: departments[0].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@company.com', departmentId: departments[1].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'David', lastName: 'Brown', email: 'david.brown@company.com', departmentId: departments[2].id, locationId: locations[1].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Eve', lastName: 'Davis', email: 'eve.davis@company.com', departmentId: departments[3].id, locationId: locations[1].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@company.com', departmentId: departments[4].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Grace', lastName: 'Wilson', email: 'grace.wilson@company.com', departmentId: departments[0].id, locationId: locations[2].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Henry', lastName: 'Moore', email: 'henry.moore@company.com', departmentId: departments[1].id, locationId: locations[2].id, status: 'OnLeave' } }),
    prisma.employee.create({ data: { firstName: 'Ivy', lastName: 'Taylor', email: 'ivy.taylor@company.com', departmentId: departments[0].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@company.com', departmentId: departments[3].id, locationId: locations[1].id, status: 'Terminated' } }),
    prisma.employee.create({ data: { firstName: 'Karen', lastName: 'Thomas', email: 'karen.thomas@company.com', departmentId: departments[4].id, locationId: locations[0].id, status: 'Active' } }),
    prisma.employee.create({ data: { firstName: 'Leo', lastName: 'Jackson', email: 'leo.jackson@company.com', departmentId: departments[2].id, locationId: locations[2].id, status: 'Active' } }),
  ])
  console.log(`  ✓ ${employees.length} employees`)

  // Assets
  const now = new Date()
  const warrantyFuture = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())
  const warrantySoon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15) // 15 days from now
  const warrantyPast = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const assets = await Promise.all([
    prisma.asset.create({ data: { computerName: 'WS-AJOHNSON-01', serialNumber: 'DLL-2024-A001', categoryId: cats.laptop, vendorId: vendors[0].id, model: 'Dell Latitude 5540', purchaseDate: new Date('2024-01-15'), purchaseCost: 1349.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'WS-BSMITH-01', serialNumber: 'DLL-2024-A002', categoryId: cats.laptop, vendorId: vendors[0].id, model: 'Dell Latitude 7440', purchaseDate: new Date('2024-02-20'), purchaseCost: 1599.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'WS-CWILLIAMS-01', serialNumber: 'APL-2024-M001', categoryId: cats.laptop, vendorId: vendors[1].id, model: 'MacBook Pro 14"', purchaseDate: new Date('2024-03-10'), purchaseCost: 2499.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'WS-DBROWN-01', serialNumber: 'LEN-2024-T001', categoryId: cats.laptop, vendorId: vendors[2].id, model: 'ThinkPad X1 Carbon', purchaseDate: new Date('2024-04-05'), purchaseCost: 1899.99, warrantyExpiration: warrantySoon, status: 'Assigned', locationId: locations[1].id } }),
    prisma.asset.create({ data: { computerName: 'IT-LAP-005', serialNumber: 'DLL-2024-A003', categoryId: cats.laptop, vendorId: vendors[0].id, model: 'Dell Latitude 5540', purchaseDate: new Date('2024-05-15'), purchaseCost: 1349.99, warrantyExpiration: warrantyFuture, status: 'Available', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-LAP-006', serialNumber: 'APL-2024-M002', categoryId: cats.laptop, vendorId: vendors[1].id, model: 'MacBook Air M3', purchaseDate: new Date('2024-06-01'), purchaseCost: 1299.99, warrantyExpiration: warrantyFuture, status: 'Available', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'WS-FMILLER-01', serialNumber: 'DLL-2024-D001', categoryId: cats.desktop, vendorId: vendors[0].id, model: 'Dell OptiPlex 7010', purchaseDate: new Date('2024-01-20'), purchaseCost: 899.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-DSK-002', serialNumber: 'DLL-2024-D002', categoryId: cats.desktop, vendorId: vendors[0].id, model: 'Dell OptiPlex 5000', purchaseDate: new Date('2023-06-15'), purchaseCost: 749.99, warrantyExpiration: warrantyPast, status: 'Retired', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-MON-001', serialNumber: 'DLL-2024-M001', categoryId: cats.peripherals, vendorId: vendors[0].id, model: 'Dell U2723QE 27"', purchaseDate: new Date('2024-01-15'), purchaseCost: 619.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-MON-002', serialNumber: 'DLL-2024-M002', categoryId: cats.peripherals, vendorId: vendors[0].id, model: 'Dell U2723QE 27"', purchaseDate: new Date('2024-01-15'), purchaseCost: 619.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-MON-003', serialNumber: 'DLL-2024-M003', categoryId: cats.peripherals, vendorId: vendors[0].id, model: 'Dell P2422H 24"', purchaseDate: new Date('2024-03-20'), purchaseCost: 329.99, warrantyExpiration: warrantySoon, status: 'Available', locationId: locations[1].id } }),
    prisma.asset.create({ data: { computerName: 'SW-CORE-01', serialNumber: 'CSC-2024-N001', categoryId: cats.network, vendorId: vendors[4].id, model: 'Cisco Catalyst 9200', purchaseDate: new Date('2023-12-01'), purchaseCost: 3499.99, warrantyExpiration: warrantyFuture, status: 'Available', locationId: locations[0].id, notes: 'Core network switch - Floor 3' } }),
    prisma.asset.create({ data: { computerName: 'AP-FL3-01', serialNumber: 'CSC-2024-N002', categoryId: cats.network, vendorId: vendors[4].id, model: 'Cisco Meraki MR46', purchaseDate: new Date('2024-02-15'), purchaseCost: 799.99, warrantyExpiration: warrantyFuture, status: 'Available', locationId: locations[0].id, notes: 'Wireless AP - Floor 3' } }),
    prisma.asset.create({ data: { computerName: 'IT-PRF-001', serialNumber: 'LOG-2024-K001', categoryId: cats.peripherals, vendorId: vendors[2].id, model: 'Logitech MX Keys', purchaseDate: new Date('2024-01-15'), purchaseCost: 99.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-PRF-002', serialNumber: 'LOG-2024-M001', categoryId: cats.peripherals, vendorId: vendors[2].id, model: 'Logitech MX Master 3S', purchaseDate: new Date('2024-01-15'), purchaseCost: 99.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id } }),
    prisma.asset.create({ data: { computerName: 'IT-SFT-001', serialNumber: 'MS-365-E3-001', categoryId: cats.software, vendorId: vendors[3].id, model: 'Microsoft 365 E3', purchaseDate: new Date('2024-01-01'), purchaseCost: 432.00, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id, notes: 'Annual subscription - 50 seats' } }),
    prisma.asset.create({ data: { computerName: 'IT-SFT-002', serialNumber: 'MS-VS-ENT-001', categoryId: cats.software, vendorId: vendors[3].id, model: 'Visual Studio Enterprise', purchaseDate: new Date('2024-01-01'), purchaseCost: 5999.99, warrantyExpiration: warrantyFuture, status: 'Assigned', locationId: locations[0].id, notes: '10 developer licenses' } }),
    prisma.asset.create({ data: { computerName: 'IT-LAP-007', serialNumber: 'LEN-2023-T002', categoryId: cats.laptop, vendorId: vendors[2].id, model: 'ThinkPad T14', purchaseDate: new Date('2023-03-20'), purchaseCost: 1199.99, warrantyExpiration: warrantyPast, status: 'InRepair', locationId: locations[0].id, notes: 'Screen replacement needed' } }),
    prisma.asset.create({ data: { computerName: 'IT-LAP-008', serialNumber: 'DLL-2023-A004', categoryId: cats.laptop, vendorId: vendors[0].id, model: 'Dell Latitude 5530', purchaseDate: new Date('2023-01-10'), purchaseCost: 1249.99, warrantyExpiration: warrantyPast, status: 'LostStolen', locationId: locations[1].id, notes: 'Reported lost during business travel' } }),
    prisma.asset.create({ data: { computerName: 'IT-MON-004', serialNumber: 'DLL-2023-M004', categoryId: cats.peripherals, vendorId: vendors[0].id, model: 'Dell P2419H 24"', purchaseDate: new Date('2022-06-15'), purchaseCost: 279.99, warrantyExpiration: warrantyPast, status: 'Retired', locationId: locations[0].id } }),
  ])
  console.log(`  ✓ ${assets.length} base assets`)

  // Generate 100 extra dummy assets for Forecast Simulations
  const dummyAssets = []
  for (let i = 1; i <= 100; i++) {
    // Random date between 2020 and 2024
    const start = new Date(2020, 0, 1).getTime()
    const end = new Date(2024, 11, 31).getTime()
    const randomDate = new Date(start + Math.random() * (end - start))
    
    // Random category
    const isLaptop = Math.random() > 0.4
    const catId = isLaptop ? cats.laptop : cats.desktop
    const prefix = isLaptop ? 'LAP' : 'DSK'
    const price = isLaptop ? 1200 + Math.floor(Math.random() * 800) : 800 + Math.floor(Math.random() * 500)
    
    dummyAssets.push({
      computerName: `SIM-${prefix}-${i.toString().padStart(3, '0')}`,
      serialNumber: `SIM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      categoryId: catId,
      vendorId: vendors[Math.floor(Math.random() * vendors.length)].id,
      model: isLaptop ? 'Simulation Laptop Pro' : 'Simulation Desktop PC',
      purchaseDate: randomDate,
      purchaseCost: price,
      status: Math.random() > 0.8 ? 'Available' : 'Assigned',
      locationId: locations[Math.floor(Math.random() * locations.length)].id
    })
  }

  await prisma.asset.createMany({ data: dummyAssets })
  console.log(`  ✓ 100 dummy simulation assets created`)

  // Assignments
  const assignmentData = [
    { assetId: assets[0].computerName, employeeId: employees[0].id, assignedDate: new Date('2024-01-15'), expectedReturnDate: new Date('2027-01-15'), assignedBy: 'IT Admin', checkOutCondition: 'New in box' },
    { assetId: assets[1].computerName, employeeId: employees[1].id, assignedDate: new Date('2024-02-01'), expectedReturnDate: new Date('2027-02-01'), assignedBy: 'IT Admin', checkOutCondition: 'Excellent' },
    { assetId: assets[2].computerName, employeeId: employees[2].id, assignedDate: new Date('2023-11-10'), expectedReturnDate: new Date('2026-11-10'), assignedBy: 'IT Admin', checkOutCondition: 'Good' },
    { assetId: assets[3].computerName, employeeId: employees[3].id, assignedDate: new Date('2024-03-20'), expectedReturnDate: new Date('2027-03-20'), assignedBy: 'IT Admin', checkOutCondition: 'New' },
    // Returned assignment
    { assetId: assets[4].computerName, employeeId: employees[4].id, assignedDate: new Date('2023-01-10'), actualReturnDate: new Date('2024-01-05'), assignedBy: 'IT Admin', checkOutCondition: 'Good', checkInCondition: 'Fair, some scratches' },
  ]

  for (const data of assignmentData) {
    await prisma.assetAssignment.create({ data })
  }
  console.log(`  ✓ ${assignmentData.length} assignments`)

  // Maintenance Logs
  const maintenanceData = [
    { assetId: assets[0].computerName, serviceDate: new Date('2024-02-15'), serviceType: 'RoutineMaintenance', vendorId: vendors[0].id, cost: 0, description: 'Initial setup and imaging', performedBy: 'IT Admin' },
    { assetId: assets[4].computerName, serviceDate: new Date('2024-01-06'), serviceType: 'Repair', vendorId: vendors[2].id, cost: 150.00, description: 'Screen replacement after return', performedBy: 'Tech Repair Co.' },
    { assetId: assets[10].computerName, serviceDate: new Date('2024-03-01'), serviceType: 'Audit', cost: 0, description: 'Annual network equipment audit', performedBy: 'IT Admin' },
    { assetId: assets[2].computerName, serviceDate: new Date('2023-12-15'), serviceType: 'Upgrade', vendorId: vendors[1].id, cost: 75.00, description: 'RAM upgrade to 32GB', performedBy: 'IT Support' },
  ]

  for (const data of maintenanceData) {
    await prisma.maintenanceLog.create({ data })
  }
  console.log(`  ✓ ${maintenanceData.length} maintenance logs`)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
