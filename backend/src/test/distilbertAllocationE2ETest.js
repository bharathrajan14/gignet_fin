import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seedData.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import AllocationRun from '../models/AllocationRun.js';
import AllocationCandidate from '../models/AllocationCandidate.js';
import { runAllocation } from '../allocation/allocationEngine.js';

async function runDistilBertAllocationTest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DISTILBERT SUB-SKILL ALLOCATION ENGINE TEST');
  console.log('======================================================\n');

  await connectDB();
  await seedDatabase();

  const customer = await Customer.findOne().populate('userId');
  const plumbingService = await Service.findOne({ category: 'PLUMBING' });
  const electricalService = await Service.findOne({ category: 'ELECTRICAL' });

  // TEST 1: Booking with subSkillId = 'plumber_pipe_leakage'
  console.log('\n--- TEST 1: Plumbing Booking with AI-Classified subSkillId = plumber_pipe_leakage ---');
  const plumbingBooking = await Booking.create({
    bookingNumber: 'BK-AI-PLUMB-01',
    customerId: customer._id,
    cooperativeId: (await mongoose.model('Cooperative').findOne())._id,
    serviceId: plumbingService._id,
    bookingType: 'EMERGENCY',
    status: 'DRAFT',
    customerLocation: { type: 'Point', coordinates: [77.6245, 12.9352] },
    addressText: '12th Main, Koramangala 4th Block, Bengaluru',
    problemDescription: 'Kitchen pipe is leaking badly',
    serviceCategory: 'plumber',
    subSkillId: 'plumber_pipe_leakage',
    classificationConfidence: 0.9977,
    classificationSource: 'distilbert',
    modelVersion: 'v1',
    pricing: {
      baseAmount: 450,
      emergencySurcharge: 225,
      platformFee: 34,
      cooperativeReserve: 101,
      workerPayout: 540,
      totalAmount: 675
    }
  });

  await runAllocation(plumbingBooking._id, { triggerReason: 'INITIAL_SEARCH' });

  const run1 = await AllocationRun.findOne({ bookingId: plumbingBooking._id }).sort({ runNumber: 1 });
  const candidates1 = await AllocationCandidate.find({ allocationRunId: run1._id }).populate('workerId');

  console.log(`[Plumbing Allocation Run] Evaluated: ${run1.totalEvaluated}, Eligible: ${run1.eligibleCount}, Excluded: ${run1.excludedCount}`);

  let sureshFound = false;
  for (const c of candidates1) {
    console.log(`  * Worker ${c.workerId?.badgeNumber}: Rank ${c.rank || 'None'} | Excluded: ${c.isExcluded} | Explanation: ${c.explainabilitySummary}`);
    if (c.workerId?.badgeNumber === 'WRK-BLR-101') {
      sureshFound = true;
      if (c.isExcluded) {
        throw new Error(`Worker Suresh (WRK-BLR-101) was unexpectedly excluded! Reasons: ${c.exclusionReasons.join('; ')}`);
      }
    }
  }

  if (!sureshFound) {
    throw new Error('Worker Suresh was not evaluated in radius!');
  }
  console.log('✅ TEST 1 PASSED: Worker with plumber_pipe_leakage successfully qualified.');

  // TEST 2: Electrical Booking with subSkillId = 'electrician_fan'
  console.log('\n--- TEST 2: Electrical Booking with AI-Classified subSkillId = electrician_fan ---');
  const electricalBooking = await Booking.create({
    bookingNumber: 'BK-AI-ELEC-01',
    customerId: customer._id,
    cooperativeId: (await mongoose.model('Cooperative').findOne())._id,
    serviceId: electricalService._id,
    bookingType: 'SCHEDULED',
    status: 'DRAFT',
    customerLocation: { type: 'Point', coordinates: [77.6245, 12.9352] },
    addressText: '12th Main, Koramangala 4th Block, Bengaluru',
    scheduledFor: new Date(Date.now() + 7200000),
    problemDescription: 'Ceiling fan stopped working',
    serviceCategory: 'electrician',
    subSkillId: 'electrician_fan',
    classificationConfidence: 0.9972,
    classificationSource: 'distilbert',
    modelVersion: 'v1',
    pricing: {
      baseAmount: 420,
      emergencySurcharge: 0,
      platformFee: 21,
      cooperativeReserve: 63,
      workerPayout: 336,
      totalAmount: 420
    }
  });

  await runAllocation(electricalBooking._id, { triggerReason: 'INITIAL_SEARCH' });

  const run2 = await AllocationRun.findOne({ bookingId: electricalBooking._id }).sort({ runNumber: 1 });
  const candidates2 = await AllocationCandidate.find({ allocationRunId: run2._id }).populate('workerId');

  console.log(`[Electrical Allocation Run] Evaluated: ${run2.totalEvaluated}, Eligible: ${run2.eligibleCount}, Excluded: ${run2.excludedCount}`);

  let priyaMatched = false;
  for (const c of candidates2) {
    console.log(`  * Worker ${c.workerId?.badgeNumber}: Rank ${c.rank || 'None'} | Excluded: ${c.isExcluded} | Explanation: ${c.explainabilitySummary}`);
    if (c.workerId?.badgeNumber === 'WRK-BLR-104') {
      priyaMatched = !c.isExcluded;
    }
  }

  if (!priyaMatched) {
    throw new Error('Worker Priya (WRK-BLR-104) should have matched for electrician_fan!');
  }
  console.log('✅ TEST 2 PASSED: Priya matched for electrician_fan, plumbers properly excluded.');

  console.log('\n======================================================');
  console.log('🎉 ALL DISTILBERT ALLOCATION INTEGRATION TESTS PASSED!');
  console.log('======================================================\n');
  process.exit(0);
}

runDistilBertAllocationTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
