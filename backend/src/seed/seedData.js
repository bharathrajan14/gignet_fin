import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Customer from '../models/Customer.js';
import Cooperative from '../models/Cooperative.js';
import Service from '../models/Service.js';
import Skill from '../models/Skill.js';
import Certification from '../models/Certification.js';
import Worker from '../models/Worker.js';
import WorkerLocation from '../models/WorkerLocation.js';
import WorkerSchedule from '../models/WorkerSchedule.js';
import Forecast from '../models/Forecast.js';
import { toH3 } from '../utils/geoUtils.js';

export async function seedDatabaseIfEmpty() {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log(`[Seed] Database already seeded with ${existingUsers} users. Skipping initial seed.`);
    return;
  }
  await seedDatabase();
}

export async function seedDatabase() {
  console.log(`[Seed] Initiating clean seed for GIGNET SIH Demo...`);

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Customer.deleteMany({}),
    Cooperative.deleteMany({}),
    Service.deleteMany({}),
    Skill.deleteMany({}),
    Certification.deleteMany({}),
    Worker.deleteMany({}),
    WorkerLocation.deleteMany({}),
    WorkerSchedule.deleteMany({}),
    Forecast.deleteMany({})
  ]);

  // 1. Cooperatives
  const coopBengaluruSouth = await Cooperative.create({
    name: 'Bengaluru South Labour Welfare Cooperative Society',
    code: 'COOP_BLR_01',
    registrationNumber: 'REG-KA-BLR-2024-0012',
    contactPhone: '+91 80 2555 1234',
    email: 'contact@blr-south-coop.org',
    centerLocation: { type: 'Point', coordinates: [77.6245, 12.9352] }, // Koramangala
    operationalRadiusKm: 15,
    coveredH3Cells: [toH3(12.9352, 77.6245, 7)],
    activeWorkersCount: 4,
    reserveFundBalance: 12500
  });

  const coopIndiranagar = await Cooperative.create({
    name: 'Indiranagar Urban Labour Cooperative Society',
    code: 'COOP_BLR_02',
    registrationNumber: 'REG-KA-BLR-2024-0045',
    contactPhone: '+91 80 2521 8899',
    email: 'ops@indiranagar-labour.org',
    centerLocation: { type: 'Point', coordinates: [77.6412, 12.9719] }, // Indiranagar
    operationalRadiusKm: 12,
    coveredH3Cells: [toH3(12.9719, 77.6412, 7)],
    activeWorkersCount: 3,
    reserveFundBalance: 8400
  });

  // 2. Skills & Certifications
  await Skill.insertMany([
    { name: 'Basic Plumbing & Fixtures', code: 'PLUMBING_BASIC', category: 'PLUMBING', description: 'Tap, washbasin, valve installations' },
    { name: 'Pipe Fitting & Leakage Repair', code: 'PIPE_FITTING', category: 'PLUMBING', description: 'Concealed pipe bursts, PVC/GI joints' },
    { name: 'Domestic Electrical Safety', code: 'ELECTRICAL_SAFETY', category: 'ELECTRICAL', description: 'Switchboards, MCB trips, wiring diagnostics' },
    { name: 'Appliance Diagnostics', code: 'APPLIANCE_REPAIR', category: 'APPLIANCE', description: 'Washing machines, geysers, refrigerators' }
  ]);

  await Certification.create({
    name: 'Govt Certified High-Voltage Domestic Electrician',
    code: 'ELEC_HV_CERT',
    issuingBody: 'National Skill Development Corporation (NSDC)',
    category: 'ELECTRICAL',
    validityYears: 3
  });

  // 3. Services Catalog
  const emergencyPlumbing = await Service.create({
    name: 'Emergency Pipe Burst & Leakage Repair',
    code: 'SVC_PLUMB_EMERGENCY',
    category: 'PLUMBING',
    description: 'Immediate response within 30-45 mins for acute water leaks, burst pipes, and flooding valves.',
    basePrice: 450,
    emergencyMultiplier: 1.5, // Total 675 for emergency
    estimatedDurationMinutes: 45,
    requiredSkills: ['PLUMBING_BASIC', 'PIPE_FITTING']
  });

  const scheduledPlumbing = await Service.create({
    name: 'Scheduled Tap & Sanitary Ware Installation',
    code: 'SVC_PLUMB_SCHEDULED',
    category: 'PLUMBING',
    description: 'Planned sanitary installation, faucet replacement, and preventative pipe checks.',
    basePrice: 350,
    emergencyMultiplier: 1.0,
    estimatedDurationMinutes: 60,
    requiredSkills: ['PLUMBING_BASIC']
  });

  const emergencyElectrical = await Service.create({
    name: 'Emergency Short Circuit & MCB Failure',
    code: 'SVC_ELEC_EMERGENCY',
    category: 'ELECTRICAL',
    description: 'Urgent diagnostic and repair for sudden electrical blackout, sparking, or blown MCB.',
    basePrice: 500,
    emergencyMultiplier: 1.5,
    estimatedDurationMinutes: 45,
    requiredSkills: ['ELECTRICAL_SAFETY'],
    requiredCertifications: ['ELEC_HV_CERT']
  });

  const scheduledDeepClean = await Service.create({
    name: 'Full Home Deep Cleaning & Sanitization',
    code: 'SVC_CLEAN_SCHEDULED',
    category: 'CLEANING',
    description: 'Comprehensive sanitization of kitchen, bathrooms, and living quarters.',
    basePrice: 750,
    emergencyMultiplier: 1.0,
    estimatedDurationMinutes: 120,
    requiredSkills: []
  });

  // 4. Users: Customer, Admin, Federation Admin
  const customerUser = await User.create({
    email: 'asha.customer@gignet.in',
    phoneNumber: '+919876543210',
    role: 'CUSTOMER'
  });
  await Profile.create({
    userId: customerUser._id,
    fullName: 'Asha Sharma',
    address: { street: '12th Main, 4th Block', city: 'Koramangala, Bengaluru', pincode: '560034', state: 'Karnataka' }
  });
  await Customer.create({
    userId: customerUser._id,
    defaultLocation: { type: 'Point', coordinates: [77.6245, 12.9352] },
    h3Res7: toH3(12.9352, 77.6245, 7)
  });

  const adminUser = await User.create({
    email: 'admin.koramangala@gignet.in',
    phoneNumber: '+919876500001',
    role: 'COOPERATIVE_ADMIN'
  });
  await Profile.create({
    userId: adminUser._id,
    fullName: 'Vikram Gowda (Coop Admin)',
    address: { street: 'Labour Welfare Bhavan', city: 'Bengaluru', pincode: '560034', state: 'Karnataka' }
  });

  const fedAdminUser = await User.create({
    email: 'federation.karnataka@gignet.in',
    phoneNumber: '+919876500002',
    role: 'FEDERATION_ADMIN'
  });
  await Profile.create({
    userId: fedAdminUser._id,
    fullName: 'Dr. Rajeshwari (Federation Secretary)'
  });

  // 5. Workers specifically configured to demonstrate Allocation Engine behavior:

  // WORKER 1: Suresh Kumar - Balanced Plumber (2.1 km away, 4.9 rating, LOW workload / 2 jobs today)
  const sureshUser = await User.create({
    email: 'suresh.worker@gignet.in',
    phoneNumber: '+919876511111',
    role: 'WORKER'
  });
  await Profile.create({ userId: sureshUser._id, fullName: 'Suresh Kumar' });
  const workerSuresh = await Worker.create({
    userId: sureshUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-101',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['PLUMBING_BASIC', 'PIPE_FITTING'],
    rating: { average: 4.9, count: 48 },
    reliabilityScore: 98,
    fairnessMetrics: {
      completedJobsCount: 14,
      emergencyJobsCount: 3,
      scheduledJobsCount: 11,
      totalEarnings: 8200,
      weeklyEarnings: 1200,
      weeklyAssignedHours: 5, // ~1 hr worked today -> utilization score = 1 - (1/8) = 0.875
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerSuresh._id,
    location: { type: 'Point', coordinates: [77.6320, 12.9310] }, // ~2.1 km from customer
    h3Res7: toH3(12.9310, 77.6320, 7),
    h3Res8: toH3(12.9310, 77.6320, 8),
    isOnline: true
  });

  // WORKER 2: Ramesh Patil - Overloaded Plumber (0.8 km away - CLOSER, but OVERLOADED / 8 jobs)
  // Scheduled: Suresh wins due to 60% workload fairness!
  // Emergency: Ramesh wins due to 70% proximity!
  const rameshUser = await User.create({
    email: 'ramesh.worker@gignet.in',
    phoneNumber: '+919876522222',
    role: 'WORKER'
  });
  await Profile.create({ userId: rameshUser._id, fullName: 'Ramesh Patil' });
  const workerRamesh = await Worker.create({
    userId: rameshUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-102',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['PLUMBING_BASIC', 'PIPE_FITTING'],
    rating: { average: 4.8, count: 62 },
    reliabilityScore: 95,
    fairnessMetrics: {
      completedJobsCount: 38,
      emergencyJobsCount: 12,
      scheduledJobsCount: 26,
      totalEarnings: 22400,
      weeklyEarnings: 6800,
      weeklyAssignedHours: 35, // ~7 hrs worked today -> utilization score = 1 - (7/8) = 0.125
      workloadStatus: 'OVERLOADED'
    }
  });
  await WorkerLocation.create({
    workerId: workerRamesh._id,
    location: { type: 'Point', coordinates: [77.6280, 12.9340] }, // ~0.8 km from customer (very close!)
    h3Res7: toH3(12.9340, 77.6280, 7),
    h3Res8: toH3(12.9340, 77.6280, 8),
    isOnline: true
  });

  // WORKER 3: Ravi Verma - Has upcoming 10:00 AM booking (Demonstrates Ravi/Kumar Dynamic Slack Rule!)
  const raviUser = await User.create({
    email: 'ravi.worker@gignet.in',
    phoneNumber: '+919876533333',
    role: 'WORKER'
  });
  await Profile.create({ userId: raviUser._id, fullName: 'Ravi Verma' });
  const workerRavi = await Worker.create({
    userId: raviUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-103',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['PLUMBING_BASIC', 'PIPE_FITTING'],
    rating: { average: 4.7, count: 32 },
    reliabilityScore: 94,
    fairnessMetrics: {
      completedJobsCount: 10,
      totalEarnings: 5500,
      weeklyEarnings: 1500,
      weeklyAssignedHours: 8,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerRavi._id,
    location: { type: 'Point', coordinates: [77.6210, 12.9380] }, // 1.2 km
    h3Res7: toH3(12.9380, 77.6210, 7),
    isOnline: true
  });

  // Ravi has a confirmed booking starting in 25 minutes from now!
  const now = new Date();
  await WorkerSchedule.create({
    workerId: workerRavi._id,
    startDateTime: new Date(now.getTime() + 25 * 60000), // 25 min in future
    endDateTime: new Date(now.getTime() + 85 * 60000),
    scheduleType: 'CONFIRMED_BOOKING',
    status: 'CONFIRMED',
    location: { type: 'Point', coordinates: [77.6150, 12.9250] },
    notes: 'Confirmed morning bathroom repair.'
  });

  // WORKER 4: Priya Sundaram - Certified Electrician
  const priyaUser = await User.create({
    email: 'priya.worker@gignet.in',
    phoneNumber: '+919876544444',
    role: 'WORKER'
  });
  await Profile.create({ userId: priyaUser._id, fullName: 'Priya Sundaram' });
  const workerPriya = await Worker.create({
    userId: priyaUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-104',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['ELECTRICAL_SAFETY'],
    certifications: [{
      code: 'ELEC_HV_CERT',
      name: 'Govt Certified High-Voltage Domestic Electrician',
      certificateNo: 'NSDC-2024-9982',
      issuingBody: 'NSDC',
      expiryDate: new Date(Date.now() + 365 * 86400000),
      isVerified: true
    }],
    rating: { average: 4.95, count: 54 },
    fairnessMetrics: {
      completedJobsCount: 22,
      weeklyEarnings: 2800,
      weeklyAssignedHours: 12,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerPriya._id,
    location: { type: 'Point', coordinates: [77.6350, 12.9400] },
    h3Res7: toH3(12.9400, 77.6350, 7),
    isOnline: true
  });

  // 6. Seed Initial 7-Day Forecast & Gap Data
  const forecastItems = [
    { offset: 1, demand: 16.2, gap: 12.2 },
    { offset: 2, demand: 15.0, gap: 11.0 },
    { offset: 3, demand: 17.4, gap: 13.4 },
    { offset: 4, demand: 14.8, gap: 10.8 },
    { offset: 5, demand: 18.0, gap: 14.0 },
    { offset: 6, demand: 21.5, gap: 17.5 },
    { offset: 7, demand: 19.6, gap: 15.6 }
  ];

  const forecastDocs = forecastItems.map(item => ({
    cooperativeId: coopBengaluruSouth._id,
    serviceCategory: 'PLUMBING',
    targetDate: new Date(Date.now() + item.offset * 86400000),
    predictedDemandCount: item.demand,
    confidenceLower: item.demand - 2.0,
    confidenceUpper: item.demand + 2.5,
    currentAvailableWorkforce: 4,
    workforceGap: item.gap,
    actionRecommendation: 'REQUEST_WORKERS_INWARD',
    modelMetadata: { algorithm: 'Ridge Regression with Seasonality', compute: 'CPU-only' }
  }));
  await Forecast.insertMany(forecastDocs);

  console.log(`[Seed] Seeded successfully!`);
  console.log(`- 2 Cooperatives: Bengaluru South, Indiranagar`);
  console.log(`- 4 Services: Emergency & Scheduled Plumbing, Electrical, Cleaning`);
  console.log(`- 4 Workers: Suresh (Balanced), Ramesh (Overloaded), Ravi (Slack Conflict), Priya (Certified)`);
  console.log(`- 1 Customer: Asha Sharma`);
  console.log(`- 2 Admins: Vikram (Coop Admin), Dr. Rajeshwari (Federation Admin)`);
}

// Run directly if invoked from command line
if (process.argv[1]?.endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  });
}
