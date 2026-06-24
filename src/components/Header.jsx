import { useEffect, useState } from "react";
import { navItems, PHONE, PHONE_DISPLAY } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../lib/ThemeContext";
import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label={t("brand.home")}>
        <img src="/images/viptransfer-logo.png" alt={t("brand.alt")} />
      </a>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={t("nav.toggleMenu")}
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {navItems.map(({ key, href }) => (
          <a href={href} onClick={() => setOpen(false)} key={key}>
            {t(`nav.${key}`)}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
        <LanguageSwitcher />
        <a className="phone-link" href={`tel:${PHONE}`}>
          <Icon name="phone" size={16} /> {PHONE_DISPLAY}
        </a>
        <a className="btn btn-gold btn-small" href="#booking">{t("nav.bookNow")}</a>
      </div>
    </header>
  );
}
