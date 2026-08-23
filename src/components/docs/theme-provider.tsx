import { ScriptOnce } from "@tanstack/react-router";
import * as React from "react";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getResolvedTheme(theme: Theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  return isTheme(storedTheme) ? storedTheme : defaultTheme;
}

function disableTransitions() {
  if (typeof document === "undefined") {
    return () => {};
  }

  const css = document.createElement("style");
  css.setAttribute("type", "text/css");
  css.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(css);

  return () => {
    // Force browser reflow so new styles calculate instantly
    (() => window.getComputedStyle(document.body))();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.head.contains(css)) {
          document.head.removeChild(css);
        }
      });
    });
  };
}

function applyTheme(theme: Theme, disableTransition = true) {
  if (typeof document === "undefined") {
    return theme === "system" ? "light" : theme;
  }

  const enableTransitions = disableTransition ? disableTransitions() : () => {};
  const resolvedTheme = getResolvedTheme(theme);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  root.dataset.theme = theme;

  enableTransitions();

  return resolvedTheme;
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey);
  const fallback = JSON.stringify(defaultTheme);

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r;e.dataset.theme=t}catch(e){}})();`;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getStoredTheme(storageKey, defaultTheme),
  );
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() =>
    getResolvedTheme(getStoredTheme(storageKey, defaultTheme)),
  );

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, nextTheme);
        } catch {
          // Ignore local storage errors
        }
      }
      const resolved = applyTheme(nextTheme, true);
      setThemeState(nextTheme);
      setResolvedTheme(resolved);
    },
    [storageKey],
  );

  React.useEffect(() => {
    const storedTheme = getStoredTheme(storageKey, defaultTheme);
    const resolved = applyTheme(storedTheme, false);
    setThemeState(storedTheme);
    setResolvedTheme(resolved);
  }, [defaultTheme, storageKey]);

  React.useEffect(() => {
    if (theme !== "system") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = applyTheme("system", true);
      setResolvedTheme(resolved);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext value={value}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
