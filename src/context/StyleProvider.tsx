// import { saveTheme } from '../../constant/localStorage';
// import { Theme } from '../../constant/style';
import { Theme } from '../constant/style';
import { PrefKey, setPref } from '@/lib/helper/localStorage';
import { createContext, useContext, useState } from 'react';

type StyleContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const StyleContext = createContext<StyleContextType | null>(null);

export const StyleProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, _setTheme] = useState<Theme>(Theme.Dark);

  const setTheme = (theme: Theme) => {
    _setTheme(theme);
    setPref(PrefKey.Theme, theme);
  };

  return (
    <StyleContext.Provider value={{ theme, setTheme }}>
      {children}
    </StyleContext.Provider>
  );
};
export const useStyleContext = () => {
  const ctx = useContext(StyleContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
