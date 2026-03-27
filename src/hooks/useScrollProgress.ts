import { useState, useEffect } from 'react';

export const useScrollProgress = (): number => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight) {
        setScrollProgress((currentScroll / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return scrollProgress;
};
