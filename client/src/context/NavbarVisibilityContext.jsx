import { createContext, useContext, useState, useCallback } from 'react';

const NavbarVisibilityContext = createContext(null);

export function NavbarVisibilityProvider({ children }) {
  const [hidden, setHidden] = useState(false);

  const hideNavbar = useCallback(() => setHidden(true), []);
  const showNavbar = useCallback(() => setHidden(false), []);

  return (
    <NavbarVisibilityContext.Provider value={{ hidden, hideNavbar, showNavbar }}>
      {children}
    </NavbarVisibilityContext.Provider>
  );
}

export function useNavbarVisibility() {
  const ctx = useContext(NavbarVisibilityContext);
  if (!ctx) throw new Error('useNavbarVisibility must be used within a NavbarVisibilityProvider');
  return ctx;
}