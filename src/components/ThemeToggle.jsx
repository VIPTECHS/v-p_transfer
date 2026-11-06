import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";
import { useI18n } from "../i18n/I18nContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useI18n();
  const dark = theme === "dark";
  const labels = {
    tr: dark ? "Açık moda geç" : "Koyu moda geç",
    en: dark ? "Switch to light mode" : "Switch to dark mode",
    de: dark ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln",
  };
  const label = labels[lang] || labels.en;
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
