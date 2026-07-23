import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { getPage, createPage, updatePage } from "../api/pages";

const LANGS = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

const SITE_URL = "https://viptransfer.com";

const EMPTY_TR = () => ({ title: "", metaDescription: "", bodyHtml: "" });
const emptyTranslations = () => ({ tr: EMPTY_TR(), en: EMPTY_TR(), de: EMPTY_TR() });

function slugify(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ERROR_MESSAGES = {
  SLUG_TAKEN: "Bu URL uzantısı zaten kullanımda.",
  RESERVED_SLUG: "Bu uzantı sistem tarafından ayrılmış, başka bir tane seçin.",
  INVALID_SLUG: "Geçersiz URL uzantısı.",
  TITLE_REQUIRED: "En az bir dilde başlık girmelisiniz.",
};

export default function PageEditor({ id, onBack }) {
  const isNew = !id || id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeLang, setActiveLang] = useState("tr");

  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [jsonLdType, setJsonLdType] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [translations, setTranslations] = useState(emptyTranslations);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getPage(id)
      .then((page) => {
        setSlug(page.slug);
        setStatus(page.status);
        setJsonLdType(page.jsonLdType || "");
        setOgImage(page.ogImage || "");
        setTranslations({ ...emptyTranslations(), ...page.translations });
        setSlugEdited(true);
      })
      .catch(() => setError("Sayfa yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // Auto-fill slug from the Turkish title until the user edits it manually.
  useEffect(() => {
    if (isNew && !slugEdited) setSlug(slugify(translations.tr.title));
  }, [translations.tr.title, isNew, slugEdited]);

  const setField = (lang, field, val) =>
    setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: val } }));

  const previewUrl = useMemo(
    () => `${SITE_URL}${slug ? `/${slug}` : ""}`,
    [slug],
  );

  const save = async (publish) => {
    setError(null);
    setSaving(true);
    const payload = {
      slug,
      status: publish ? "published" : status,
      jsonLdType: jsonLdType.trim() || null,
      ogImage: ogImage.trim() || null,
      translations,
    };
    try {
      if (isNew) {
        const created = await createPage(payload);
        if (publish) setStatus("published");
        onBack(created);
      } else {
        await updatePage(id, payload);
        if (publish) setStatus("published");
        onBack(true);
      }
    } catch (err) {
      setError(ERROR_MESSAGES[err.body?.error] || "Kaydedilemedi. Tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card"><p>Yükleniyor…</p></div>;

  const t = translations[activeLang];

  return (
    <div className="page-editor">
      <div className="page-editor__head">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onBack()}>
          <ArrowLeft size={16} /> Geri
        </button>
        <div className="page-editor__actions">
          <button type="button" className="admin-btn admin-btn--ghost" disabled={saving} onClick={() => save(false)}>
            <Save size={16} /> Taslak kaydet
          </button>
          <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={() => save(true)}>
            {saving ? "Kaydediliyor…" : "Yayınla"}
          </button>
        </div>
      </div>

      {error && <div className="page-editor__error">{error}</div>}

      <div className="page-editor__grid">
        <div className="page-editor__main">
          <div className="admin-field">
            <label>URL uzantısı</label>
            <div className="page-editor__slug">
              <span>{SITE_URL}/</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
                placeholder="ornek-sayfa"
              />
            </div>
            <a className="page-editor__preview" href={previewUrl} target="_blank" rel="noreferrer">
              {previewUrl} <ExternalLink size={12} />
            </a>
          </div>

          <div className="page-editor__langtabs">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`page-editor__langtab${activeLang === l.code ? " is-active" : ""}`}
                onClick={() => setActiveLang(l.code)}
              >
                {l.label}
                {translations[l.code].title ? <span className="dot" /> : null}
              </button>
            ))}
          </div>

          <div className="admin-field">
            <label>Başlık (H1) — {activeLang.toUpperCase()}</label>
            <input value={t.title} onChange={(e) => setField(activeLang, "title", e.target.value)} placeholder="Sayfa başlığı" />
          </div>

          <div className="admin-field">
            <label>Meta açıklama (SEO) — {activeLang.toUpperCase()}</label>
            <textarea
              value={t.metaDescription}
              onChange={(e) => setField(activeLang, "metaDescription", e.target.value)}
              maxLength={320}
              rows={2}
              placeholder="Google'da görünecek 140–160 karakterlik özet"
            />
            <small>{t.metaDescription.length}/160 önerilen</small>
          </div>

          <div className="admin-field">
            <label>İçerik — {activeLang.toUpperCase()}</label>
            <RichTextEditor
              value={t.bodyHtml}
              onChange={(html) => setField(activeLang, "bodyHtml", html)}
              placeholder="Sayfa içeriğini buraya yazın…"
            />
          </div>
        </div>

        <aside className="page-editor__side">
          <div className="admin-card">
            <h4>Yayın</h4>
            <p className="page-editor__status">
              Durum: <strong>{status === "published" ? "Yayında" : "Taslak"}</strong>
            </p>
          </div>
          <div className="admin-card">
            <h4>Gelişmiş SEO</h4>
            <div className="admin-field">
              <label>Schema tipi (opsiyonel)</label>
              <select value={jsonLdType} onChange={(e) => setJsonLdType(e.target.value)}>
                <option value="">WebPage (varsayılan)</option>
                <option value="Service">Service (hizmet)</option>
                <option value="Article">Article (makale)</option>
                <option value="AboutPage">AboutPage</option>
                <option value="ContactPage">ContactPage</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Paylaşım görseli (OG image URL)</label>
              <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…/gorsel.jpg" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
