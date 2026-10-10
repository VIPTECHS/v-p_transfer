import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Globe } from "lucide-react";
import { fetchBlogArticles, updateBlogArticle } from "../api/admin";

const SITE_URL = "https://viptransfer.com";

export default function BlogArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchBlogArticles()
      .then(setArticles)
      .catch(() => setError("Blog yazıları yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (article) => {
    setSavingId(article.id);
    setError("");
    try {
      await updateBlogArticle(article.id, { status: article.status === "published" ? "draft" : "published" });
      load();
    } catch {
      setError("Yazının yayın durumu değiştirilemedi.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="pages-view">
      <div className="pages-view__head">
        <p className="pages-view__hint">
          AI Asistan'dan blog yazısı oluşturmasını isteyin. Onaylanan yazılar burada taslak olarak görünür;
          yayına almak için durumunu değiştirin.
        </p>
      </div>
      {error && <div className="page-editor__error">{error}</div>}
      {loading ? (
        <div className="admin-card"><p>Yükleniyor…</p></div>
      ) : articles.length === 0 ? (
        <div className="admin-card pages-empty"><FileText size={28} strokeWidth={1.5} /><p>Henüz AI tarafından oluşturulmuş blog yazısı yok.</p></div>
      ) : (
        <div className="pages-table">
          {articles.map((article) => {
            const title = article.translations?.tr?.title || article.translations?.en?.title || article.slug;
            const langs = ["tr", "en", "de"].filter((lang) => article.translations?.[lang]?.title);
            return (
              <div key={article.id} className="pages-row">
                <div className="pages-row__main">
                  <span className="pages-row__title">{title}</span>
                  {article.status === "published" ? (
                    <a className="pages-row__slug" href={`${SITE_URL}/blog/${article.slug}`} target="_blank" rel="noreferrer">
                      /blog/{article.slug} <ExternalLink size={11} />
                    </a>
                  ) : <span className="pages-row__slug">/blog/{article.slug}</span>}
                </div>
                <div className="pages-row__langs">{langs.map((lang) => <span key={lang} className="pages-lang-badge">{lang.toUpperCase()}</span>)}</div>
                <button
                  type="button"
                  className={`pages-status pages-status--${article.status}`}
                  onClick={() => toggleStatus(article)}
                  disabled={savingId === article.id}
                  title="Durumu değiştir"
                >
                  <Globe size={13} /> {savingId === article.id ? "Kaydediliyor…" : article.status === "published" ? "Yayında" : "Taslak"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
