/**
 * Centralized Service Catalog Multilingual Translation Layer
 * English (en) & Natural Tamil (ta)
 */
import enData from './en.json';
import taData from './ta.json';

export const DICTIONARIES = {
  en: enData,
  ta: taData
};

/**
 * Standardize slug/key lookup
 */
function normalizeKey(str) {
  if (!str) return '';
  const s = str.toString().trim().toLowerCase();
  if (s.includes('plumb')) return 'plumber';
  if (s.includes('elec')) return 'electrician';
  if (s.includes('carp')) return 'carpenter';
  if (s.includes('mech')) return 'mechanic';
  if (s.includes('driv')) return 'driver';
  if (s.includes('appl') || s.includes('hvac')) return 'appliance';
  if (s.includes('clean')) return 'cleaning';
  if (s.includes('paint') || s.includes('mason')) return 'masonry';
  return s;
}

/**
 * Translate main service category name
 * e.g., 'plumber' -> 'Plumbing' (en) / 'குழாய் பழுது சேவை' (ta)
 */
export function getServiceName(serviceKey, lang = 'en') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const key = normalizeKey(serviceKey);
  return dict.services?.[key] || DICTIONARIES.en.services?.[key] || serviceKey;
}

/**
 * Translate sub-service name
 * e.g., 'plumber_pipe_leakage' -> 'Pipe Leakage' (en) / 'குழாய் கசிவு' (ta)
 */
export function getSubServiceName(subSkillId, lang = 'en') {
  if (!subSkillId) return '';
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  return dict.subServices?.[subSkillId] || DICTIONARIES.en.subServices?.[subSkillId] || subSkillId;
}

/**
 * Get detailed service description
 */
export function getServiceDescription(serviceKey, lang = 'en') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const key = normalizeKey(serviceKey);
  return dict.serviceDescriptions?.[key] || DICTIONARIES.en.serviceDescriptions?.[key] || '';
}

/**
 * Translate booking type (EMERGENCY, SCHEDULED)
 */
export function getBookingTypeName(bookingType, lang = 'en') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const key = (bookingType || '').toUpperCase();
  return dict.bookingTypes?.[key] || DICTIONARIES.en.bookingTypes?.[key] || bookingType;
}

/**
 * Translate booking status (SEARCHING, CONFIRMED, COMPLETED, PAID, etc.)
 */
export function getBookingStatusName(status, lang = 'en') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const key = (status || '').toUpperCase();
  return dict.bookingStatuses?.[key] || DICTIONARIES.en.bookingStatuses?.[key] || status;
}

/**
 * Translate worker skill name and detailed description
 */
export function getWorkerSkillInfo(skillId, lang = 'en') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const entry = dict.workerSkills?.[skillId] || DICTIONARIES.en.workerSkills?.[skillId];
  if (entry) {
    return entry;
  }
  // Fallback to subServices dictionary if defined
  const subName = getSubServiceName(skillId, lang);
  return {
    name: subName || skillId,
    desc: subName ? `${subName} verified specialist` : ''
  };
}

/**
 * Nested key accessor helper (e.g., 'ai.detectedProblem', 'emergency.sosBtn')
 */
export function t(keyPath, lang = 'en', fallback = '') {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const keys = keyPath.split('.');
  let current = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      current = undefined;
      break;
    }
  }

  if (current !== undefined && typeof current !== 'object') {
    return current;
  }

  // Fallback to English
  let enCurrent = DICTIONARIES.en;
  for (const k of keys) {
    if (enCurrent && typeof enCurrent === 'object' && k in enCurrent) {
      enCurrent = enCurrent[k];
    } else {
      enCurrent = undefined;
      break;
    }
  }

  return enCurrent !== undefined && typeof enCurrent !== 'object' ? enCurrent : (fallback || keyPath);
}
