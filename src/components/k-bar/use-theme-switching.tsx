import { useTheme } from "next-themes";
import { Action, useRegisterActions } from "kbar";

/**
 * A custom hook for managing theme switching functionality using the useTheme hook.
 *
 * This hook registers theme-related actions for use with kbar command palette:
 * - Toggle between light and dark themes (shortcut: "t t")
 * - Set light theme explicitly
 * - Set dark theme explicitly
 *
 * The actions are re-registered whenever the theme changes.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   useThemeSwitching();
 *   return <div>Theme switching enabled!</div>;
 * };
 * ```
 */
const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const themeAction: Action[] = [
    {
      id: "toggleTheme",
      name: "Toggle Theme",
      shortcut: ["t", "t"],
      section: "Theme",
      perform: toggleTheme,
    },
    {
      id: "setLightTheme",
      name: "Set Light Theme",
      section: "Theme",
      perform: () => setTheme("light"),
    },
    {
      id: "setDarkTheme",
      name: "Set Dark Theme",
      section: "Theme",
      perform: () => setTheme("dark"),
    },
  ];

  useRegisterActions(themeAction, [theme]);
};

export default useThemeSwitching;
