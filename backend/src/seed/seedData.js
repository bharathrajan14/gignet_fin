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
  console.log(`[Seed] Initiating clean seed for GIGNET SIH Multi-Cooperative Ecosystem...`);

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

  // 1. Cooperatives (Expanded from 2 to 6 across Bengaluru regions)
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
    reserveFundBalance: 14500
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
    reserveFundBalance: 9800
  });

  const coopWhitefield = await Cooperative.create({
    name: 'Whitefield Tech Corridor Labour Cooperative Society',
    code: 'COOP_BLR_03',
    registrationNumber: 'REG-KA-BLR-2024-0078',
    contactPhone: '+91 80 2845 3344',
    email: 'help@whitefield-coop.org',
    centerLocation: { type: 'Point', coordinates: [77.7499, 12.9698] }, // Whitefield
    operationalRadiusKm: 18,
    coveredH3Cells: [toH3(12.9698, 77.7499, 7)],
    activeWorkersCount: 5,
    reserveFundBalance: 16200
  });

  const coopJayanagar = await Cooperative.create({
    name: 'Jayanagar - JP Nagar Artisan & Utility Workers Guild',
    code: 'COOP_BLR_04',
    registrationNumber: 'REG-KA-BLR-2024-0091',
    contactPhone: '+91 80 2663 4455',
    email: 'guild@jayanagar-workers.org',
    centerLocation: { type: 'Point', coordinates: [77.5855, 12.9250] }, // Jayanagar
    operationalRadiusKm: 14,
    coveredH3Cells: [toH3(12.9250, 77.5855, 7)],
    activeWorkersCount: 4,
    reserveFundBalance: 11300
  });

  const coopMalleshwaram = await Cooperative.create({
    name: 'Malleshwaram Traditional Skilled Guild Cooperative',
    code: 'COOP_BLR_05',
    registrationNumber: 'REG-KA-BLR-2024-0105',
    contactPhone: '+91 80 2334 6677',
    email: 'info@malleshwaram-guild.org',
    centerLocation: { type: 'Point', coordinates: [77.5714, 13.0031] }, // Malleshwaram
    operationalRadiusKm: 12,
    coveredH3Cells: [toH3(13.0031, 77.5714, 7)],
    activeWorkersCount: 3,
    reserveFundBalance: 8900
  });

  const coopHsrLayout = await Cooperative.create({
    name: 'HSR Layout Urban Services Cooperative Society',
    code: 'COOP_BLR_06',
    registrationNumber: 'REG-KA-BLR-2024-0122',
    contactPhone: '+91 80 2572 7788',
    email: 'admin@hsr-coop.org',
    centerLocation: { type: 'Point', coordinates: [77.6389, 12.9121] }, // HSR Layout
    operationalRadiusKm: 10,
    coveredH3Cells: [toH3(12.9121, 77.6389, 7)],
    activeWorkersCount: 4,
    reserveFundBalance: 13700
  });

  // 2. Skills & Certifications
  await Skill.insertMany([
    { name: 'Basic Plumbing & Fixtures', code: 'PLUMBING_BASIC', category: 'PLUMBING', description: 'Tap, washbasin, valve installations' },
    { name: 'Pipe Fitting & Leakage Repair', code: 'PIPE_FITTING', category: 'PLUMBING', description: 'Concealed pipe bursts, PVC/GI joints' },
    { name: 'Domestic Electrical Safety', code: 'ELECTRICAL_SAFETY', category: 'ELECTRICAL', description: 'Switchboards, MCB trips, wiring diagnostics' },
    { name: 'Appliance Diagnostics & Repair', code: 'APPLIANCE_REPAIR', category: 'APPLIANCE', description: 'Water purifiers, geysers, washing machines, chimneys' },
    { name: 'HVAC & Refrigeration Services', code: 'HVAC_REPAIR', category: 'APPLIANCE', description: 'AC jet cleaning, compressor diagnostics, gas refill' },
    { name: 'Structural Carpentry & Woodcraft', code: 'CARPENTRY_SKILL', category: 'CARPENTRY', description: 'Door locks, hinge realignment, furniture restoration' },
    { name: 'Deep Sanitization & Hygiene', code: 'CLEANING_HYGIENE', category: 'CLEANING', description: 'Commercial sanitization, bathroom restoration, germicidal misting' }
  ]);

  await Certification.create({
    name: 'Govt Certified High-Voltage Domestic Electrician',
    code: 'ELEC_HV_CERT',
    issuingBody: 'National Skill Development Corporation (NSDC)',
    category: 'ELECTRICAL',
    validityYears: 3
  });

  await Certification.create({
    name: 'Certified HVAC & Refrigeration Technician',
    code: 'HVAC_CERT',
    issuingBody: 'Bureau of Energy Efficiency (BEE)',
    category: 'APPLIANCE',
    validityYears: 3
  });

  // 3. Expanded Services Catalog (10 high-demand cooperative services)
  await Service.insertMany([
    {
      name: 'Emergency Pipe Burst & Leakage Repair',
      code: 'SVC_PLUMB_EMERGENCY',
      category: 'PLUMBING',
      description: 'Immediate 30-min response for acute pipe bursts, severe ceiling seepage, and high-pressure valve blowouts.',
      basePrice: 450,
      emergencyMultiplier: 1.5,
      estimatedDurationMinutes: 45,
      requiredSkills: ['PLUMBING_BASIC', 'PIPE_FITTING']
    },
    {
      name: 'Scheduled Tap & Sanitary Installation',
      code: 'SVC_PLUMB_SCHEDULED',
      category: 'PLUMBING',
      description: 'Planned sanitary installation, faucet replacement, concealed valve fitting, and pressure gauge checks.',
      basePrice: 350,
      emergencyMultiplier: 1.0,
      estimatedDurationMinutes: 60,
      requiredSkills: ['PLUMBING_BASIC']
    },
    {
      name: 'Emergency Short Circuit & MCB Failure',
      code: 'SVC_ELEC_EMERGENCY',
      category: 'ELECTRICAL',
      description: 'Urgent diagnostic and repair for sudden electrical blackout, sparking, phase imbalances, or blown MCB.',
      basePrice: 500,
      emergencyMultiplier: 1.5,
      estimatedDurationMinutes: 45,
      requiredSkills: ['ELECTRICAL_SAFETY'],
      requiredCertifications: ['ELEC_HV_CERT']
    },
    {
      name: 'Scheduled Switchboard & Wiring Upgrade',
      code: 'SVC_ELEC_SCHEDULED',
      category: 'ELECTRICAL',
      description: 'Modern modular switchboard fittings, concealed earthing verification, and load distribution balancing.',
      basePrice: 420,
      emergencyMultiplier: 1.0,
      estimatedDurationMinutes: 60,
      requiredSkills: ['ELECTRICAL_SAFETY']
    },
    {
      name: 'AC Deep Jet Sanitization & Gas Recharge',
      code: 'SVC_HVAC_AC_JET',
      category: 'APPLIANCE',
      description: 'High-pressure foam coil washing, blower wheel sterilizing, filter de-clogging, and R32/R410 gas top-up.',
      basePrice: 650,
      emergencyMultiplier: 1.25,
      estimatedDurationMinutes: 75,
      requiredSkills: ['HVAC_REPAIR'],
      requiredCertifications: ['HVAC_CERT']
    },
    {
      name: 'RO Water Purifier Diagnostic & Filter Overhaul',
      code: 'SVC_APPL_RO_OVERHAUL',
      category: 'APPLIANCE',
      description: 'Comprehensive TDS analysis, sediment & carbon filter replacement, and booster pump pressure testing.',
      basePrice: 480,
      emergencyMultiplier: 1.2,
      estimatedDurationMinutes: 50,
      requiredSkills: ['APPLIANCE_REPAIR']
    },
    {
      name: 'Kitchen Chimney Degreasing & Duct Inspection',
      code: 'SVC_APPL_CHIMNEY',
      category: 'APPLIANCE',
      description: 'Deep non-caustic motor degreasing, baffle filter ultrasonic cleaning, and external exhaust duct check.',
      basePrice: 520,
      emergencyMultiplier: 1.2,
      estimatedDurationMinutes: 65,
      requiredSkills: ['APPLIANCE_REPAIR']
    },
    {
      name: 'Carpentry Structural Lock & Door Fix',
      code: 'SVC_CARP_LOCK_DOOR',
      category: 'CARPENTRY',
      description: 'Main door deadbolt fitting, lock cylinder re-keying, sagging hinge realignments, and door frame truing.',
      basePrice: 390,
      emergencyMultiplier: 1.25,
      estimatedDurationMinutes: 55,
      requiredSkills: ['CARPENTRY_SKILL']
    },
    {
      name: 'Solar Inverter & Battery Emergency Restoration',
      code: 'SVC_ELEC_SOLAR_INV',
      category: 'ELECTRICAL',
      description: 'Fast troubleshooting of grid switch failure, inverter inverter faults, and battery electrolyte topping.',
      basePrice: 580,
      emergencyMultiplier: 1.4,
      estimatedDurationMinutes: 50,
      requiredSkills: ['ELECTRICAL_SAFETY'],
      requiredCertifications: ['ELEC_HV_CERT']
    },
    {
      name: 'Full Home Deep Sanitization & Germicidal Cleaning',
      code: 'SVC_CLEAN_DEEP',
      category: 'CLEANING',
      description: 'Hospital-grade steam sanitization for kitchens, living spaces, bathrooms, and high-touch surface zones.',
      basePrice: 750,
      emergencyMultiplier: 1.0,
      estimatedDurationMinutes: 120,
      requiredSkills: ['CLEANING_HYGIENE']
    }
  ]);

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

  // 5. Workers (Expanded to 9 workers across diverse cooperatives & skill profiles)

  // WORKER 1: Suresh Kumar - Balanced Plumber (2.1 km away, 4.9 rating, LOW workload)
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
    skills: [
      'PLUMBING_BASIC',
      'PIPE_FITTING',
      'plumber_pipe_leakage',
      'plumber_tap_leakage',
      'plumber_drain_blockage',
      'plumber_toilet_repair',
      'plumber_water_pump_repair',
      'plumber_bathroom_fitting'
    ],
    rating: { average: 4.9, count: 48 },
    reliabilityScore: 98,
    fairnessMetrics: {
      completedJobsCount: 14,
      emergencyJobsCount: 3,
      scheduledJobsCount: 11,
      totalEarnings: 8200,
      weeklyEarnings: 1200,
      weeklyAssignedHours: 5,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerSuresh._id,
    location: { type: 'Point', coordinates: [77.6320, 12.9310] },
    h3Res7: toH3(12.9310, 77.6320, 7),
    h3Res8: toH3(12.9310, 77.6320, 8),
    isOnline: true
  });

  // WORKER 2: Ramesh Patil - Overloaded Plumber (0.8 km away - CLOSER, but OVERLOADED)
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
    skills: [
      'PLUMBING_BASIC',
      'PIPE_FITTING',
      'plumber_pipe_leakage',
      'plumber_tap_leakage',
      'plumber_drain_blockage',
      'plumber_bathroom_fitting'
    ],
    rating: { average: 4.8, count: 62 },
    reliabilityScore: 95,
    fairnessMetrics: {
      completedJobsCount: 38,
      emergencyJobsCount: 12,
      scheduledJobsCount: 26,
      totalEarnings: 22400,
      weeklyEarnings: 6800,
      weeklyAssignedHours: 35,
      workloadStatus: 'OVERLOADED'
    }
  });
  await WorkerLocation.create({
    workerId: workerRamesh._id,
    location: { type: 'Point', coordinates: [77.6280, 12.9340] },
    h3Res7: toH3(12.9340, 77.6280, 7),
    h3Res8: toH3(12.9340, 77.6280, 8),
    isOnline: true
  });

  // WORKER 3: Ravi Verma - Upcoming Scheduled Booking (Demonstrates Dynamic Slack rule)
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
    skills: [
      'PLUMBING_BASIC',
      'PIPE_FITTING',
      'plumber_pipe_leakage',
      'plumber_tap_leakage',
      'plumber_toilet_repair'
    ],
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
    location: { type: 'Point', coordinates: [77.6210, 12.9380] },
    h3Res7: toH3(12.9380, 77.6210, 7),
    isOnline: true
  });
  const now = new Date();
  await WorkerSchedule.create({
    workerId: workerRavi._id,
    startDateTime: new Date(now.getTime() + 25 * 60000),
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
    skills: [
      'ELECTRICAL_SAFETY',
      'electrician_fan',
      'electrician_washing_machine',
      'electrician_kitchen_items',
      'electrician_installation',
      'electrician_wiring'
    ],
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

  // WORKER 5: Ananya Rao - Master HVAC & AC Specialist (Whitefield Coop)
  const ananyaUser = await User.create({
    email: 'ananya.worker@gignet.in',
    phoneNumber: '+919876555555',
    role: 'WORKER'
  });
  await Profile.create({ userId: ananyaUser._id, fullName: 'Ananya Rao' });
  const workerAnanya = await Worker.create({
    userId: ananyaUser._id,
    cooperativeId: coopWhitefield._id,
    badgeNumber: 'WRK-BLR-105',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['HVAC_REPAIR'],
    certifications: [{
      code: 'HVAC_CERT',
      name: 'Certified HVAC & Refrigeration Technician',
      certificateNo: 'BEE-2024-4411',
      issuingBody: 'BEE',
      expiryDate: new Date(Date.now() + 365 * 86400000),
      isVerified: true
    }],
    rating: { average: 4.98, count: 71 },
    fairnessMetrics: {
      completedJobsCount: 19,
      weeklyEarnings: 4200,
      weeklyAssignedHours: 14,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerAnanya._id,
    location: { type: 'Point', coordinates: [77.7420, 12.9710] },
    h3Res7: toH3(12.9710, 77.7420, 7),
    isOnline: true
  });

  // WORKER 6: Manoj Gowda - Senior Carpenter (Jayanagar Guild)
  const manojUser = await User.create({
    email: 'manoj.worker@gignet.in',
    phoneNumber: '+919876566666',
    role: 'WORKER'
  });
  await Profile.create({ userId: manojUser._id, fullName: 'Manoj Gowda' });
  const workerManoj = await Worker.create({
    userId: manojUser._id,
    cooperativeId: coopJayanagar._id,
    badgeNumber: 'WRK-BLR-106',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: [
      'CARPENTRY_SKILL',
      'carpenter_door_repair',
      'carpenter_furniture_repair',
      'carpenter_cupboard_repair',
      'carpenter_bed_repair',
      'carpenter_shelf_installation'
    ],
    rating: { average: 4.88, count: 39 },
    fairnessMetrics: {
      completedJobsCount: 17,
      weeklyEarnings: 3100,
      weeklyAssignedHours: 10,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerManoj._id,
    location: { type: 'Point', coordinates: [77.5890, 12.9280] },
    h3Res7: toH3(12.9280, 77.5890, 7),
    isOnline: true
  });

  // WORKER 7: Deepa M. - Appliance & RO Water Purifier Expert (Bengaluru South)
  const deepaUser = await User.create({
    email: 'deepa.worker@gignet.in',
    phoneNumber: '+919876577777',
    role: 'WORKER'
  });
  await Profile.create({ userId: deepaUser._id, fullName: 'Deepa M.' });
  const workerDeepa = await Worker.create({
    userId: deepaUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-107',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['APPLIANCE_REPAIR'],
    rating: { average: 4.92, count: 44 },
    fairnessMetrics: {
      completedJobsCount: 26,
      weeklyEarnings: 3900,
      weeklyAssignedHours: 16,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerDeepa._id,
    location: { type: 'Point', coordinates: [77.6270, 12.9300] },
    h3Res7: toH3(12.9300, 77.6270, 7),
    isOnline: true
  });

  // WORKER 8: Karthik N. - Solar & Electrical Power Tech (Malleshwaram Guild)
  const karthikUser = await User.create({
    email: 'karthik.worker@gignet.in',
    phoneNumber: '+919876588888',
    role: 'WORKER'
  });
  await Profile.create({ userId: karthikUser._id, fullName: 'Karthik N.' });
  const workerKarthik = await Worker.create({
    userId: karthikUser._id,
    cooperativeId: coopMalleshwaram._id,
    badgeNumber: 'WRK-BLR-108',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['ELECTRICAL_SAFETY'],
    certifications: [{
      code: 'ELEC_HV_CERT',
      name: 'Govt Certified High-Voltage Domestic Electrician',
      certificateNo: 'NSDC-2024-8112',
      issuingBody: 'NSDC',
      expiryDate: new Date(Date.now() + 365 * 86400000),
      isVerified: true
    }],
    rating: { average: 4.85, count: 31 },
    fairnessMetrics: {
      completedJobsCount: 15,
      weeklyEarnings: 2900,
      weeklyAssignedHours: 9,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerKarthik._id,
    location: { type: 'Point', coordinates: [77.5750, 13.0010] },
    h3Res7: toH3(13.0010, 77.5750, 7),
    isOnline: true
  });

  // WORKER 9: Rajeshwari K. - Sanitization & Deep Cleaning Lead (HSR Layout Coop)
  const rajUser = await User.create({
    email: 'rajeshwari.worker@gignet.in',
    phoneNumber: '+919876599999',
    role: 'WORKER'
  });
  await Profile.create({ userId: rajUser._id, fullName: 'Rajeshwari K.' });
  const workerRajeshwari = await Worker.create({
    userId: rajUser._id,
    cooperativeId: coopHsrLayout._id,
    badgeNumber: 'WRK-BLR-109',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CLEANING_HYGIENE'],
    rating: { average: 4.94, count: 58 },
    fairnessMetrics: {
      completedJobsCount: 31,
      weeklyEarnings: 5600,
      weeklyAssignedHours: 20,
      workloadStatus: 'BALANCED'
    }
  });
  await WorkerLocation.create({
    workerId: workerRajeshwari._id,
    location: { type: 'Point', coordinates: [77.6350, 12.9150] },
    h3Res7: toH3(12.9150, 77.6350, 7),
    isOnline: true
  });

  // WORKER 10: Venkatesh M. - Senior Plumbing Contractor (Jayanagar Guild)
  const venkatUser = await User.create({
    email: 'venkatesh.worker@gignet.in',
    phoneNumber: '+919876500010',
    role: 'WORKER'
  });
  await Profile.create({ userId: venkatUser._id, fullName: 'Venkatesh M.' });
  const workerVenkat = await Worker.create({
    userId: venkatUser._id,
    cooperativeId: coopJayanagar._id,
    badgeNumber: 'WRK-BLR-110',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['PLUMBING_BASIC', 'PIPE_FITTING'],
    rating: { average: 4.86, count: 42 },
    fairnessMetrics: { completedJobsCount: 18, weeklyEarnings: 3200, weeklyAssignedHours: 11, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerVenkat._id,
    location: { type: 'Point', coordinates: [77.5920, 12.9290] },
    h3Res7: toH3(12.9290, 77.5920, 7),
    isOnline: true
  });

  // WORKER 11: Arun Kumar - Domestic Electrician (HSR Layout Coop)
  const arunUser = await User.create({
    email: 'arun.worker@gignet.in',
    phoneNumber: '+919876500011',
    role: 'WORKER'
  });
  await Profile.create({ userId: arunUser._id, fullName: 'Arun Kumar' });
  const workerArun = await Worker.create({
    userId: arunUser._id,
    cooperativeId: coopHsrLayout._id,
    badgeNumber: 'WRK-BLR-111',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['ELECTRICAL_SAFETY'],
    rating: { average: 4.91, count: 47 },
    fairnessMetrics: { completedJobsCount: 20, weeklyEarnings: 3400, weeklyAssignedHours: 12, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerArun._id,
    location: { type: 'Point', coordinates: [77.6390, 12.9140] },
    h3Res7: toH3(12.9140, 77.6390, 7),
    isOnline: true
  });

  // WORKER 12: Sneha Reddy - Certified Commercial Electrician (Indiranagar Coop)
  const snehaUser = await User.create({
    email: 'sneha.worker@gignet.in',
    phoneNumber: '+919876500012',
    role: 'WORKER'
  });
  await Profile.create({ userId: snehaUser._id, fullName: 'Sneha Reddy' });
  const workerSneha = await Worker.create({
    userId: snehaUser._id,
    cooperativeId: coopIndiranagar._id,
    badgeNumber: 'WRK-BLR-112',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['ELECTRICAL_SAFETY'],
    rating: { average: 4.97, count: 64 },
    fairnessMetrics: { completedJobsCount: 25, weeklyEarnings: 4100, weeklyAssignedHours: 15, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerSneha._id,
    location: { type: 'Point', coordinates: [77.6410, 12.9780] },
    h3Res7: toH3(12.9780, 77.6410, 7),
    isOnline: true
  });

  // WORKER 13: Imran Khan - Geyser & Home Appliance Technician (Bengaluru South)
  const imranUser = await User.create({
    email: 'imran.worker@gignet.in',
    phoneNumber: '+919876500013',
    role: 'WORKER'
  });
  await Profile.create({ userId: imranUser._id, fullName: 'Imran Khan' });
  const workerImran = await Worker.create({
    userId: imranUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-113',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['APPLIANCE_REPAIR'],
    rating: { average: 4.89, count: 37 },
    fairnessMetrics: { completedJobsCount: 16, weeklyEarnings: 2900, weeklyAssignedHours: 10, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerImran._id,
    location: { type: 'Point', coordinates: [77.6250, 12.9320] },
    h3Res7: toH3(12.9320, 77.6250, 7),
    isOnline: true
  });

  // WORKER 14: Pooja Hegde - Master HVAC & Split AC Specialist (HSR Layout)
  const poojaUser = await User.create({
    email: 'pooja.worker@gignet.in',
    phoneNumber: '+919876500014',
    role: 'WORKER'
  });
  await Profile.create({ userId: poojaUser._id, fullName: 'Pooja Hegde' });
  const workerPooja = await Worker.create({
    userId: poojaUser._id,
    cooperativeId: coopHsrLayout._id,
    badgeNumber: 'WRK-BLR-114',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['HVAC_REPAIR', 'APPLIANCE_REPAIR'],
    rating: { average: 4.96, count: 52 },
    fairnessMetrics: { completedJobsCount: 22, weeklyEarnings: 4500, weeklyAssignedHours: 13, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerPooja._id,
    location: { type: 'Point', coordinates: [77.6330, 12.9180] },
    h3Res7: toH3(12.9180, 77.6330, 7),
    isOnline: true
  });

  // WORKER 15: Harish Shetty - Artisan Woodworker & Cabinetmaker (Koramangala)
  const harishUser = await User.create({
    email: 'harish.worker@gignet.in',
    phoneNumber: '+919876500015',
    role: 'WORKER'
  });
  await Profile.create({ userId: harishUser._id, fullName: 'Harish Shetty' });
  const workerHarish = await Worker.create({
    userId: harishUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-115',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CARPENTRY_SKILL'],
    rating: { average: 4.88, count: 35 },
    fairnessMetrics: { completedJobsCount: 14, weeklyEarnings: 2700, weeklyAssignedHours: 9, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerHarish._id,
    location: { type: 'Point', coordinates: [77.6290, 12.9370] },
    h3Res7: toH3(12.9370, 77.6290, 7),
    isOnline: true
  });

  // WORKER 16: Dilip Das - Modular Furniture & Locksmith (Indiranagar)
  const dilipUser = await User.create({
    email: 'dilip.worker@gignet.in',
    phoneNumber: '+919876500016',
    role: 'WORKER'
  });
  await Profile.create({ userId: dilipUser._id, fullName: 'Dilip Das' });
  const workerDilip = await Worker.create({
    userId: dilipUser._id,
    cooperativeId: coopIndiranagar._id,
    badgeNumber: 'WRK-BLR-116',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CARPENTRY_SKILL'],
    rating: { average: 4.82, count: 28 },
    fairnessMetrics: { completedJobsCount: 11, weeklyEarnings: 2200, weeklyAssignedHours: 7, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerDilip._id,
    location: { type: 'Point', coordinates: [77.6430, 12.9730] },
    h3Res7: toH3(12.9730, 77.6430, 7),
    isOnline: true
  });

  // WORKER 17: Meena Bai - Deep Cleaning & Kitchen Degreaser (Koramangala)
  const meenaUser = await User.create({
    email: 'meena.worker@gignet.in',
    phoneNumber: '+919876500017',
    role: 'WORKER'
  });
  await Profile.create({ userId: meenaUser._id, fullName: 'Meena Bai' });
  const workerMeena = await Worker.create({
    userId: meenaUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-117',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CLEANING_HYGIENE'],
    rating: { average: 4.93, count: 50 },
    fairnessMetrics: { completedJobsCount: 24, weeklyEarnings: 4600, weeklyAssignedHours: 16, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerMeena._id,
    location: { type: 'Point', coordinates: [77.6260, 12.9360] },
    h3Res7: toH3(12.9360, 77.6260, 7),
    isOnline: true
  });

  // WORKER 18: Sumathi R. - Hospital Grade Sanitization Specialist (Jayanagar)
  const sumathiUser = await User.create({
    email: 'sumathi.worker@gignet.in',
    phoneNumber: '+919876500018',
    role: 'WORKER'
  });
  await Profile.create({ userId: sumathiUser._id, fullName: 'Sumathi R.' });
  const workerSumathi = await Worker.create({
    userId: sumathiUser._id,
    cooperativeId: coopJayanagar._id,
    badgeNumber: 'WRK-BLR-118',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CLEANING_HYGIENE'],
    rating: { average: 4.90, count: 41 },
    fairnessMetrics: { completedJobsCount: 19, weeklyEarnings: 3800, weeklyAssignedHours: 14, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerSumathi._id,
    location: { type: 'Point', coordinates: [77.5870, 12.9240] },
    h3Res7: toH3(12.9240, 77.5870, 7),
    isOnline: true
  });

  // WORKER 19: Basavaraj H. - Waterproofing & Seepage Specialist (Bengaluru South)
  const basavUser = await User.create({
    email: 'basavaraj.worker@gignet.in',
    phoneNumber: '+919876500019',
    role: 'WORKER'
  });
  await Profile.create({ userId: basavUser._id, fullName: 'Basavaraj H.' });
  const workerBasav = await Worker.create({
    userId: basavUser._id,
    cooperativeId: coopBengaluruSouth._id,
    badgeNumber: 'WRK-BLR-119',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['PIPE_FITTING', 'PLUMBING_BASIC'],
    rating: { average: 4.87, count: 33 },
    fairnessMetrics: { completedJobsCount: 15, weeklyEarnings: 3100, weeklyAssignedHours: 11, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerBasav._id,
    location: { type: 'Point', coordinates: [77.6230, 12.9330] },
    h3Res7: toH3(12.9330, 77.6230, 7),
    isOnline: true
  });

  // WORKER 20: Prakash Chand - Master Painter & Crack Sealer (Jayanagar)
  const prakashUser = await User.create({
    email: 'prakash.worker@gignet.in',
    phoneNumber: '+919876500020',
    role: 'WORKER'
  });
  await Profile.create({ userId: prakashUser._id, fullName: 'Prakash Chand' });
  const workerPrakash = await Worker.create({
    userId: prakashUser._id,
    cooperativeId: coopJayanagar._id,
    badgeNumber: 'WRK-BLR-120',
    kycStatus: 'VERIFIED',
    isOnline: true,
    isAvailable: true,
    skills: ['CARPENTRY_SKILL'],
    rating: { average: 4.85, count: 29 },
    fairnessMetrics: { completedJobsCount: 12, weeklyEarnings: 2500, weeklyAssignedHours: 8, workloadStatus: 'BALANCED' }
  });
  await WorkerLocation.create({
    workerId: workerPrakash._id,
    location: { type: 'Point', coordinates: [77.5840, 12.9260] },
    h3Res7: toH3(12.9260, 77.5840, 7),
    isOnline: true
  });

  // 6. Seed 7-Day Forecast & Gap Data across ALL Categories
  const categoriesList = ['PLUMBING', 'ELECTRICAL', 'APPLIANCE', 'CARPENTRY', 'CLEANING', 'MASONRY'];
  const baselineFactors = {
    PLUMBING: { baseDemand: 16, avail: 5, mult: 1.0 },
    ELECTRICAL: { baseDemand: 14, avail: 4, mult: 0.9 },
    APPLIANCE: { baseDemand: 15, avail: 4, mult: 1.0 },
    CARPENTRY: { baseDemand: 11, avail: 3, mult: 0.8 },
    CLEANING: { baseDemand: 18, avail: 4, mult: 1.2 },
    MASONRY: { baseDemand: 9, avail: 2, mult: 0.7 }
  };

  const allForecastDocs = [];
  for (const cat of categoriesList) {
    const factor = baselineFactors[cat] || { baseDemand: 12, avail: 3, mult: 1.0 };
    for (let offset = 1; offset <= 7; offset++) {
      const isWeekend = (offset % 7 === 5 || offset % 7 === 6);
      const weekendMult = isWeekend ? 1.35 : 1.0;
      const demand = Math.round((factor.baseDemand * weekendMult + (offset * 0.4)) * 10) / 10;
      const gap = Math.max(0, Math.round((demand - factor.avail) * 10) / 10);
      const action = gap > 2 ? 'REQUEST_WORKERS_INWARD' : (gap > 0 ? 'EXPEDITE_SHIFTS' : 'BALANCED');

      allForecastDocs.push({
        cooperativeId: coopBengaluruSouth._id,
        serviceCategory: cat,
        targetDate: new Date(Date.now() + offset * 86400000),
        predictedDemandCount: demand,
        confidenceLower: Math.max(1, Math.round((demand - 2.2) * 10) / 10),
        confidenceUpper: Math.round((demand + 2.5) * 10) / 10,
        currentAvailableWorkforce: factor.avail,
        workforceGap: gap,
        actionRecommendation: action,
        modelMetadata: { algorithm: 'Ridge Regression with Temporal Seasonality', compute: 'CPU-only' }
      });
    }
  }

  await Forecast.insertMany(allForecastDocs);

  console.log(`[Seed] Seeded successfully!`);
  console.log(`- 6 Cooperatives across Bengaluru (Koramangala, Indiranagar, Whitefield, Jayanagar, Malleshwaram, HSR)`);
  console.log(`- 10 High-Demand Services across Plumbing, Electrical, HVAC, Appliance, Carpentry, Cleaning`);
  console.log(`- 20 Active Cooperative Workers with full GPS telemetry & verified skills`);
  console.log(`- 7-Day Multi-Category Forecasts initialized for all 6 trade categories`);
  console.log(`- Demo Personas initialized for instant switching`);
}

// Run directly if invoked from command line
if (process.argv[1]?.endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  });
}
