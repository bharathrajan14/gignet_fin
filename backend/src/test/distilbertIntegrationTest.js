import { 
  CANONICAL_SUB_SKILLS, 
  normalizeCategory, 
  validateCategoryMatch, 
  checkWorkerSubSkillMatch 
} from '../utils/skillMapping.js';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING GIGNET DISTILBERT BACKEND INTEGRATION TESTS');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Canonical sub-skills catalog count
  const allSubSkillIds = Object.keys(CANONICAL_SUB_SKILLS);
  assert(allSubSkillIds.length === 26, `Exact 26 canonical sub-skills defined (found ${allSubSkillIds.length})`);

  // 2. Expected sub-skills presence
  const requiredSamples = [
    'electrician_fan',
    'electrician_washing_machine',
    'plumber_pipe_leakage',
    'plumber_tap_leakage',
    'carpenter_door_repair',
    'mechanic_tyre_puncture',
    'driver_airport_transport'
  ];
  for (const id of requiredSamples) {
    assert(Boolean(CANONICAL_SUB_SKILLS[id]), `Canonical sub-skill '${id}' exists in mapping`);
  }

  // 3. Category normalization
  assert(normalizeCategory('plumber') === 'PLUMBING', 'Normalizes "plumber" to PLUMBING');
  assert(normalizeCategory('PLUMBING') === 'PLUMBING', 'Normalizes "PLUMBING" to PLUMBING');
  assert(normalizeCategory('electrician') === 'ELECTRICAL', 'Normalizes "electrician" to ELECTRICAL');
  assert(normalizeCategory('CARPENTRY') === 'CARPENTRY', 'Normalizes "CARPENTRY" to CARPENTRY');
  assert(normalizeCategory('driver') === 'DRIVER', 'Normalizes "driver" to DRIVER');

  // 4. Category Validation & Mismatch Detection
  const matchResult = validateCategoryMatch('PLUMBING', 'plumber_pipe_leakage');
  assert(matchResult.categoryMismatch === false, 'Same category (PLUMBING vs plumber_pipe_leakage) produces categoryMismatch=false');

  const mismatchResult = validateCategoryMatch('PLUMBING', 'electrician_fan');
  assert(mismatchResult.categoryMismatch === true, 'Mismatched category (PLUMBING vs electrician_fan) produces categoryMismatch=true');
  assert(mismatchResult.detectedCategory === 'ELECTRICAL', 'Identified detectedCategory as ELECTRICAL');

  // 5. Worker Sub-Skill Allocation Matcher
  const sureshSkills = ['PLUMBING_BASIC', 'PIPE_FITTING', 'plumber_pipe_leakage', 'plumber_tap_leakage'];
  assert(checkWorkerSubSkillMatch(sureshSkills, 'plumber_pipe_leakage') === true, 'Worker with exact sub-skill matches');
  assert(checkWorkerSubSkillMatch(sureshSkills, 'electrician_fan') === false, 'Worker lacking electrical sub-skill fails match');

  const legacyWorkerSkills = ['PIPE_FITTING'];
  assert(checkWorkerSubSkillMatch(legacyWorkerSkills, 'plumber_pipe_leakage') === true, 'Worker with legacy alias PIPE_FITTING matches plumber_pipe_leakage');

  console.log(`\n========================================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
