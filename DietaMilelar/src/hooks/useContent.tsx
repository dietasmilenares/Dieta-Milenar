import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import defaultTranslations from '../translations/pt-BR.json';

// Type definitions for the content structure
export type ContentType = typeof defaultTranslations;

interface ContentContextType {
  content: ContentType;
  updateContent: (newContent: ContentType) => void;
  resetContent: () => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentType>(defaultTranslations);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem('dieta_milenar_content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (e) {
        console.error('Failed to parse saved content', e);
      }
    }
  }, []);

  const updateContent = (newContent: ContentType) => {
    setContent(newContent);
    localStorage.setItem('dieta_milenar_content', JSON.stringify(newContent));
  };

  const resetContent = () => {
    setContent(defaultTranslations);
    localStorage.removeItem('dieta_milenar_content');
  };

  const login = (password: string) => {
    // Mock login - simple password check
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent, isAdmin, login, logout }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
