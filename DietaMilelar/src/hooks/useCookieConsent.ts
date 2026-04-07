import { useState, useEffect } from 'react';

interface UseCookieConsentReturn {
  hasConsented: boolean;
  acceptCookies: () => void;
}

export const useCookieConsent = (): UseCookieConsentReturn => {
  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dieta_milenar_cookie_consent') === 'true';
    }
    return true;
  });

  const acceptCookies = () => {
    localStorage.setItem('dieta_milenar_cookie_consent', 'true');
    setHasConsented(true);
  };

  return { hasConsented, acceptCookies };
};
