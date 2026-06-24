import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";

export default function AddStopsModal({ stops, onSave, onClose }) {
  const { t } = useI18n();
  const [items, setItems] = useState(stops.length > 0 ? [...stops] : [""]);

  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    setItems(next);
  };

  const add = () => {
    if (items.length < 5) setItems([...items, ""]);
  };

  const remove = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    onSave(items.filter((s) => s.trim()));
    onClose();
  };

  return (
    <div className="bw-modal-overlay" onClick={onClose}>
      <div className="bw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bw-modal-header">
          <h3>{t("wizard.addStops")}</h3>
          <button type="button" className="bw-modal-close" onClick={onClose} aria-label={t("wizard.close")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="bw-modal-body">
          {items.map((stop, i) => (
            <div className="bw-stop-row" key={i}>
              <input
                type="text"
                className="bw-stop-input"
                value={stop}
                onChange={(e) => update(i, e.target.value)}
                placeholder={t("wizard.stopPlaceholder")}
                autoFocus={i === items.length - 1}
              />
              <button type="button" className="bw-stop-remove" onClick={() => remove(i)} aria-label="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}

          {items.length < 5 && (
            <button type="button" className="bw-stop-add" onClick={add}>
              + {t("wizard.addAnotherStop")}
            </button>
          )}
        </div>

        <div className="bw-modal-footer">
          <button type="button" className="bw-modal-cancel" onClick={onClose}>{t("wizard.cancel")}</button>
          <button type="button" className="bw-modal-save" onClick={handleSave}>{t("wizard.save")}</button>
        </div>
      </div>
    </div>
  );
}
