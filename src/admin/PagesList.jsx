import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Globe, FileText } from "lucide-react";
import PageEditor from "./PageEditor";
import { listPages, deletePage, updatePage } from "../api/pages";

const SITE_URL = "https://viptransfer.com";

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | id

  const load = useCallback(() => {
    setLoading(true);
    listPages()
      .then((data) => setPages(data))
      .catch(() => setError("Sayfalar yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onBack = () => {
    setEditing(null);
    load();
  };

  const remove = async (page) => {
    if (!window.confirm(`"${page.slug}" sayfası silinsin mi? Bu geri alınamaz.`)) return;
    try {
      await deletePage(page.id);
      load();
    } catch {
      alert("Silinemedi.");
    }
  };

  const toggleStatus = async (page) => {
    try {
      await updatePage(page.id, { status: page.status === "published" ? "draft" : "published" });
      load();
    } catch {
      alert("Durum değiştirilemedi.");
    }
  };

  if (editing !== null) {
    return <PageEditor id={editing} onBack={onBack} />;
  }

  return (
    <div className="pages-view">
      <div className="pages-view__head">
        <p className="pages-view__hint">
          Kendi SEO sayfalarınızı oluşturun. Yayınladığınızda <code>viptransfer.com/&lt;uzantı&gt;</code>
          {" "}adresinde, Google ve yapay zeka botlarının tam okuyabileceği şekilde yayına girer.
        </p>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing("new")}>
          <Plus size={16} /> Yeni sayfa
        </button>
      </div>

      {error && <div className="page-editor__error">{error}</div>}

      {loading ? (
        <div className="admin-card"><p>Yükleniyor…</p></div>
      ) : pages.length === 0 ? (
        <div className="admin-card pages-empty">
          <FileText size={28} strokeWidth={1.5} />
          <p>Henüz sayfa yok. İlk SEO sayfanızı oluşturun.</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing("new")}>
            <Plus size={16} /> Yeni sayfa
          </button>
        </div>
      ) : (
        <div className="pages-table">
          {pages.map((page) => {
            const title = page.translations?.tr?.title || page.translations?.en?.title || page.slug;
            const langs = ["tr", "en", "de"].filter((l) => page.translations?.[l]?.title);
            return (
              <div key={page.id} className="pages-row">
                <div className="pages-row__main">
                  <span className="pages-row__title">{title}</span>
                  <a className="pages-row__slug" href={`${SITE_URL}/${page.slug}`} target="_blank" rel="noreferrer">
                    /{page.slug} <ExternalLink size={11} />
                  </a>
                </div>
                <div className="pages-row__langs">
                  {langs.map((l) => <span key={l} className="pages-lang-badge">{l.toUpperCase()}</span>)}
                </div>
                <button
                  type="button"
                  className={`pages-status pages-status--${page.status}`}
                  onClick={() => toggleStatus(page)}
                  title="Durumu değiştir"
                >
                  <Globe size={13} /> {page.status === "published" ? "Yayında" : "Taslak"}
                </button>
                <div className="pages-row__actions">
                  <button type="button" className="admin-icon-btn" title="Düzenle" onClick={() => setEditing(page.id)}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="admin-icon-btn admin-icon-btn--danger" title="Sil" onClick={() => remove(page)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
