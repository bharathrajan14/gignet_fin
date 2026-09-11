import React, { createContext, useContext, useState } from 'react';
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

const WorkerLanguageContext = createContext();

export function WorkerLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('gignet_worker_language') || 'en';
  });

  const setLanguage = (newLang) => {
    const valid = newLang === 'ta' ? 'ta' : 'en';
    setLanguageState(valid);
    localStorage.setItem('gignet_worker_language', valid);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const t = (keyPath, fallback = '') => sharedT(keyPath, language, fallback);
  const getServiceName = (serviceKey) => sharedGetServiceName(serviceKey, language);
  const getSubServiceName = (subSkillId) => sharedGetSubServiceName(subSkillId, language);
  const getServiceDescription = (serviceKey) => sharedGetServiceDescription(serviceKey, language);
  const getBookingTypeName = (type) => sharedGetBookingTypeName(type, language);
  const getBookingStatusName = (status) => sharedGetBookingStatusName(status, language);
  const getWorkerSkillInfo = (skillId) => sharedGetWorkerSkillInfo(skillId, language);

  return (
    <WorkerLanguageContext.Provider
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
    </WorkerLanguageContext.Provider>
  );
}

export function useWorkerLanguage() {
  const ctx = useContext(WorkerLanguageContext);
  if (!ctx) {
    throw new Error('useWorkerLanguage must be used within a WorkerLanguageProvider');
  }
  return ctx;
}
