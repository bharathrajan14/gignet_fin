import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getServiceName as sharedGetServiceName,
  getSubServiceName as sharedGetSubServiceName,
  getServiceDescription as sharedGetServiceDescription,
  getBookingTypeName as sharedGetBookingTypeName,
  getBookingStatusName as sharedGetBookingStatusName,
  getWorkerSkillInfo as sharedGetWorkerSkillInfo,
  t as sharedT,
  DICTIONARIES
} from '@gignet/shared';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('gignet_language') || 'en';
  });

  const setLanguage = (newLang) => {
    const valid = newLang === 'ta' ? 'ta' : 'en';
    setLanguageState(valid);
    localStorage.setItem('gignet_language', valid);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  // Helper bindings for current active language
  const t = (keyPath, fallback = '') => sharedT(keyPath, language, fallback);
  const getServiceName = (serviceKey) => sharedGetServiceName(serviceKey, language);
  const getSubServiceName = (subSkillId) => sharedGetSubServiceName(subSkillId, language);
  const getServiceDescription = (serviceKey) => sharedGetServiceDescription(serviceKey, language);
  const getBookingTypeName = (type) => sharedGetBookingTypeName(type, language);
  const getBookingStatusName = (status) => sharedGetBookingStatusName(status, language);
  const getWorkerSkillInfo = (skillId) => sharedGetWorkerSkillInfo(skillId, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isTamil: language === 'ta',
        setLanguage,
        toggleLanguage,
        t,
        getServiceName,
        getSubServiceName,
        getServiceDescription,
        getBookingTypeName,
        getBookingStatusName,
        getWorkerSkillInfo,
        dictionaries: DICTIONARIES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
