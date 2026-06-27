import { languages } from "../i18n/translations";
import { useI18n } from "../i18n/I18nContext";
import { LANG_PREFIX_RE } from "../i18n/locale";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  const changeLang = (code) => {
    setLang(code);
    // URL'i dil önekiyle güncelle (hreflang varyantlarıyla tutarlı)
    if (typeof window !== "undefined") {
      const rest = window.location.pathname.replace(LANG_PREFIX_RE, "");
      const next = `/${code}${rest || "/"}`.replace(/\/{2,}/g, "/");
      window.history.replaceState(null, "", next + window.location.search + window.location.hash);
    }
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {Object.entries(languages).map(([code, { label, name }]) => (
        <button
          key={code}
          type="button"
          className={lang === code ? "active" : ""}
          onClick={() => changeLang(code)}
          aria-pressed={lang === code}
          title={name}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
