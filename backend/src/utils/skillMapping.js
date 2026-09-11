/**
 * Canonical GIGNET Sub-Skill Mapping & Category Validation Layer
 * Authoritative mapping between Hugging Face DistilBERT classification labels and GIGNET subSkill IDs.
 */

export const CANONICAL_SUB_SKILLS = {
  // Electrician
  electrician_fan: {
    id: 'electrician_fan',
    category: 'ELECTRICAL',
    serviceCategorySlug: 'electrician',
    displayName: 'Fan Repair & Installation',
    legacySkills: ['ELECTRICAL_SAFETY']
  },
  electrician_washing_machine: {
    id: 'electrician_washing_machine',
    category: 'ELECTRICAL',
    serviceCategorySlug: 'electrician',
    displayName: 'Washing Machine Electrical Diagnostics',
    legacySkills: ['ELECTRICAL_SAFETY', 'APPLIANCE_REPAIR']
  },
  electrician_kitchen_items: {
    id: 'electrician_kitchen_items',
    category: 'ELECTRICAL',
    serviceCategorySlug: 'electrician',
    displayName: 'Kitchen Electrical Appliances',
    legacySkills: ['ELECTRICAL_SAFETY', 'APPLIANCE_REPAIR']
  },
  electrician_installation: {
    id: 'electrician_installation',
    category: 'ELECTRICAL',
    serviceCategorySlug: 'electrician',
    displayName: 'Electrical Fixture & Switchboard Installation',
    legacySkills: ['ELECTRICAL_SAFETY']
  },
  electrician_wiring: {
    id: 'electrician_wiring',
    category: 'ELECTRICAL',
    serviceCategorySlug: 'electrician',
    displayName: 'Concealed Wiring & Circuit Repair',
    legacySkills: ['ELECTRICAL_SAFETY']
  },

  // Plumber
  plumber_tap_leakage: {
    id: 'plumber_tap_leakage',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Tap & Faucet Leakage Repair',
    legacySkills: ['PLUMBING_BASIC']
  },
  plumber_pipe_leakage: {
    id: 'plumber_pipe_leakage',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Concealed Pipe Burst & Joint Leakage',
    legacySkills: ['PLUMBING_BASIC', 'PIPE_FITTING']
  },
  plumber_drain_blockage: {
    id: 'plumber_drain_blockage',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Drain & Sewer Line Blockage Clearing',
    legacySkills: ['PLUMBING_BASIC']
  },
  plumber_toilet_repair: {
    id: 'plumber_toilet_repair',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Toilet Cistern & Sanitary Repair',
    legacySkills: ['PLUMBING_BASIC']
  },
  plumber_water_pump_repair: {
    id: 'plumber_water_pump_repair',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Water Pump & Motor Repair',
    legacySkills: ['PLUMBING_BASIC']
  },
  plumber_bathroom_fitting: {
    id: 'plumber_bathroom_fitting',
    category: 'PLUMBING',
    serviceCategorySlug: 'plumber',
    displayName: 'Bathroom Sanitary Fitting & Replacement',
    legacySkills: ['PLUMBING_BASIC']
  },

  // Carpenter
  carpenter_door_repair: {
    id: 'carpenter_door_repair',
    category: 'CARPENTRY',
    serviceCategorySlug: 'carpenter',
    displayName: 'Door Hinge, Lock & Alignment Repair',
    legacySkills: ['CARPENTRY_SKILL']
  },
  carpenter_furniture_repair: {
    id: 'carpenter_furniture_repair',
    category: 'CARPENTRY',
    serviceCategorySlug: 'carpenter',
    displayName: 'Furniture Joint & Surface Restoration',
    legacySkills: ['CARPENTRY_SKILL']
  },
  carpenter_cupboard_repair: {
    id: 'carpenter_cupboard_repair',
    category: 'CARPENTRY',
    serviceCategorySlug: 'carpenter',
    displayName: 'Cupboard & Wardrobe Sliding Repair',
    legacySkills: ['CARPENTRY_SKILL']
  },
  carpenter_bed_repair: {
    id: 'carpenter_bed_repair',
    category: 'CARPENTRY',
    serviceCategorySlug: 'carpenter',
    displayName: 'Bed Frame & Headboard Reinforcement',
    legacySkills: ['CARPENTRY_SKILL']
  },
  carpenter_shelf_installation: {
    id: 'carpenter_shelf_installation',
    category: 'CARPENTRY',
    serviceCategorySlug: 'carpenter',
    displayName: 'Wall Shelf & Cabinet Installation',
    legacySkills: ['CARPENTRY_SKILL']
  },

  // Mechanic
  mechanic_brake_repair: {
    id: 'mechanic_brake_repair',
    category: 'MECHANIC',
    serviceCategorySlug: 'mechanic',
    displayName: 'Brake Pad Replacement & Inspection',
    legacySkills: ['MECHANIC_BASIC']
  },
  mechanic_engine_problem: {
    id: 'mechanic_engine_problem',
    category: 'MECHANIC',
    serviceCategorySlug: 'mechanic',
    displayName: 'Engine Overheating & Diagnostic Check',
    legacySkills: ['MECHANIC_ENGINE']
  },
  mechanic_clutch_problem: {
    id: 'mechanic_clutch_problem',
    category: 'MECHANIC',
    serviceCategorySlug: 'mechanic',
    displayName: 'Clutch Plate & Cable Replacement',
    legacySkills: ['MECHANIC_BASIC']
  },
  mechanic_battery_problem: {
    id: 'mechanic_battery_problem',
    category: 'MECHANIC',
    serviceCategorySlug: 'mechanic',
    displayName: 'Vehicle Battery Jumpstart & Replacement',
    legacySkills: ['MECHANIC_BASIC']
  },
  mechanic_tyre_puncture: {
    id: 'mechanic_tyre_puncture',
    category: 'MECHANIC',
    serviceCategorySlug: 'mechanic',
    displayName: 'Tyre Puncture & Wheel Balancing',
    legacySkills: ['MECHANIC_BASIC']
  },

  // Driver
  driver_airport_transport: {
    id: 'driver_airport_transport',
    category: 'DRIVER',
    serviceCategorySlug: 'driver',
    displayName: 'Airport Transfer & Pickup',
    legacySkills: ['DRIVER_COMMERCIAL']
  },
  driver_local_trip: {
    id: 'driver_local_trip',
    category: 'DRIVER',
    serviceCategorySlug: 'driver',
    displayName: 'City Point-to-Point Local Trip',
    legacySkills: ['DRIVER_BASIC']
  },
  driver_outstation_trip: {
    id: 'driver_outstation_trip',
    category: 'DRIVER',
    serviceCategorySlug: 'driver',
    displayName: 'Outstation Inter-city Transit',
    legacySkills: ['DRIVER_COMMERCIAL']
  },
  driver_parcel_delivery: {
    id: 'driver_parcel_delivery',
    category: 'DRIVER',
    serviceCategorySlug: 'driver',
    displayName: 'Express Parcel & Document Delivery',
    legacySkills: ['DRIVER_BASIC']
  },
  driver_goods_transport: {
    id: 'driver_goods_transport',
    category: 'DRIVER',
    serviceCategorySlug: 'driver',
    displayName: 'Commercial Goods & Logistics Transport',
    legacySkills: ['DRIVER_HEAVY']
  }
};

/**
 * Standardize category strings across formats (e.g. 'PLUMBING', 'plumber', 'Plumbing')
 */
export function normalizeCategory(categoryStr) {
  if (!categoryStr) return '';
  const clean = categoryStr.toString().trim().toUpperCase();
  if (clean.includes('PLUMB')) return 'PLUMBING';
  if (clean.includes('ELEC')) return 'ELECTRICAL';
  if (clean.includes('CARP')) return 'CARPENTRY';
  if (clean.includes('MECH')) return 'MECHANIC';
  if (clean.includes('DRIV')) return 'DRIVER';
  if (clean.includes('APPL')) return 'ELECTRICAL'; // Appliances typically fall under electrical in standard catalogs
  if (clean.includes('CLEAN')) return 'PLUMBING';
  return clean;
}

/**
 * Validate whether the detected subSkill matches the selected service category.
 */
export function validateCategoryMatch(selectedCategory, subSkillId) {
  const subSkill = CANONICAL_SUB_SKILLS[subSkillId];
  if (!subSkill) {
    return {
      isValidSubSkill: false,
      categoryMismatch: false,
      selectedCategory: normalizeCategory(selectedCategory),
      detectedCategory: 'UNKNOWN'
    };
  }

  const normalizedSelected = normalizeCategory(selectedCategory);
  const detectedCategory = subSkill.category;

  const categoryMismatch = Boolean(normalizedSelected && normalizedSelected !== detectedCategory);

  return {
    isValidSubSkill: true,
    categoryMismatch,
    selectedCategory: normalizedSelected,
    detectedCategory,
    subSkill
  };
}

/**
 * Check if a worker possesses the required sub-skill or an equivalent legacy skill.
 */
export function checkWorkerSubSkillMatch(workerSkills = [], requiredSubSkillId) {
  if (!requiredSubSkillId) return true;
  const skillsSet = new Set(workerSkills);

  // Exact match
  if (skillsSet.has(requiredSubSkillId)) {
    return true;
  }

  // Check legacy alias skills
  const meta = CANONICAL_SUB_SKILLS[requiredSubSkillId];
  if (meta && meta.legacySkills) {
    for (const legacy of meta.legacySkills) {
      if (skillsSet.has(legacy)) return true;
    }
  }

  return false;
}
