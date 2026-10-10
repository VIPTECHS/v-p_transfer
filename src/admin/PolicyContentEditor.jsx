import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { getSitePage } from "../data/sitePages";
import { listPolicyContent, savePolicyContent } from "../api/pages";

const POLICY_PAGES = [
  { slug: "cancellation-policy", label: "İptal Koşulları" },
  { slug: "terms-conditions", label: "Hizmet Koşulları" },
  { slug: "privacy-policy", label: "Gizlilik Politikası" },
  { slug: "cookie-policy", label: "Çerez Politikası" },
];
const PREVIEW_ORIGIN = typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname)
  ? window.location.origin
  : "https://viptransfer.com";
const LANGUAGES = ["tr", "en", "de"];
const EMPTY_CONTENT = { title: "", intro: "", body: "" };

function contentKey(slug, language) { return `${slug}:${language}`; }

function staticContent(slug, language) {
  const page = getSitePage(slug);
  const copy = page?.content?.[language] || page?.content?.en;
  if (!copy) return EMPTY_CONTENT;
  const body = (copy.sections || []).map((section) => [
    `## ${section.heading}`,
    ...(section.paragraphs || []),
  ].join("\n\n")).join("\n\n");
  return { title: copy.title || "", intro: copy.intro || "", body };
}

export default function PolicyContentEditor() {
  const [slug, setSlug] = useState(POLICY_PAGES[0].slug);
  const [language, setLanguage] = useState("tr");
  const [savedContent, setSavedContent] = useState({});
  const [draft, setDraft] = useState(() => staticContent(POLICY_PAGES[0].slug, "tr"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    listPolicyContent()
      .then((items) => {
        if (!active) return;
        setSavedContent(Object.fromEntries(items.map((item) => [contentKey(item.slug, item.language), {
          title: item.title, intro: item.intro, body: item.body,
        }])));
      })
      .catch(() => { if (active) setError("Yasal metinler yüklenemedi."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const key = contentKey(slug, language);
    setDraft(savedContent[key] || staticContent(slug, language));
    setError("");
  }, [slug, language, savedContent]);

  const selectedPage = useMemo(() => POLICY_PAGES.find((page) => page.slug === slug), [slug]);

  const update = (event) => {
    setSuccess("");
    setDraft((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const item = await savePolicyContent(slug, language, draft);
      setSavedContent((current) => ({
        ...current,
        [contentKey(slug, language)]: { title: item.title, intro: item.intro, body: item.body },
      }));
      setSuccess("Değişiklikler kaydedildi ve sitede yayınlandı.");
    } catch {
      setError("Kaydedilemedi. Alanları kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const previewPath = language === "tr" ? `/${slug}` : `/${language}/${slug}`;

  return (
    <div className="policy-content-editor">
      <div className="policy-content-editor__intro">
        <p>İptal, hizmet, gizlilik ve çerez metinlerini buradan düzenleyebilirsiniz. Kaydettiğiniz içerik ilgili sitede yayınlanır.</p>
        {selectedPage && <a href={`${PREVIEW_ORIGIN}${previewPath}`} target="_blank" rel="noreferrer">Sayfayı görüntüle <ExternalLink size={14} /></a>}
      </div>

      {error && <div className="admin-error" role="alert">{error}</div>}
      {loading ? <div className="admin-card admin-loading">Metinler yükleniyor…</div> : (
        <form className="admin-card policy-content-form" onSubmit={save}>
          <div className="policy-content-editor__selectors">
            <label>
              <span>Düzenlenecek metin</span>
              <select value={slug} onChange={(event) => setSlug(event.target.value)}>
                {POLICY_PAGES.map((page) => <option key={page.slug} value={page.slug}>{page.label}</option>)}
              </select>
            </label>
            <label>
              <span>Dil</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
              </select>
            </label>
          </div>

          <label className="policy-content-editor__field">
            <span>Sayfa başlığı</span>
            <input name="title" value={draft.title} onChange={update} maxLength={200} required />
          </label>
          <label className="policy-content-editor__field">
            <span>Kısa açıklama</span>
            <textarea name="intro" value={draft.intro} onChange={update} maxLength={1000} rows={3} required />
          </label>
          <label className="policy-content-editor__field">
            <span>İçerik</span>
            <textarea name="body" value={draft.body} onChange={update} maxLength={30000} rows={18} required />
            <small>Paragrafları boş satırla ayırın. Bölüm başlığı için satıra ## ve bir boşlukla başlayın.</small>
          </label>

          {success && <div className="admin-success" role="status">{success}</div>}
          <div className="policy-content-editor__actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
              <Save size={15} /> {saving ? "Kaydediliyor…" : "Kaydet ve yayınla"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
