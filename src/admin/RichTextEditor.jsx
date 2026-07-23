import { useEffect, useRef } from "react";
import {
  Bold, Italic, Underline, Heading2, Heading3,
  List, ListOrdered, Link2, Quote, Eraser,
} from "lucide-react";

// Lightweight contentEditable WYSIWYG. Emits sanitized-on-server HTML.
// execCommand is deprecated but universally supported and dependency-free,
// which keeps the admin bundle small and CSP clean.
const TOOLS = [
  { cmd: "bold", icon: Bold, title: "Kalın" },
  { cmd: "italic", icon: Italic, title: "İtalik" },
  { cmd: "underline", icon: Underline, title: "Altı çizili" },
  { cmd: "formatBlock", value: "h2", icon: Heading2, title: "Başlık 2" },
  { cmd: "formatBlock", value: "h3", icon: Heading3, title: "Başlık 3" },
  { cmd: "insertUnorderedList", icon: List, title: "Madde listesi" },
  { cmd: "insertOrderedList", icon: ListOrdered, title: "Numaralı liste" },
  { cmd: "formatBlock", value: "blockquote", icon: Quote, title: "Alıntı" },
  { cmd: "createLink", icon: Link2, title: "Bağlantı", prompt: true },
  { cmd: "removeFormat", icon: Eraser, title: "Biçimi temizle" },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);

  // Sync incoming value only when it differs (avoids clobbering the caret).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (tool) => {
    ref.current?.focus();
    if (tool.prompt) {
      const url = window.prompt("Bağlantı adresi (https://...)");
      if (!url) return;
      document.execCommand(tool.cmd, false, url);
    } else if (tool.value) {
      document.execCommand(tool.cmd, false, tool.value);
    } else {
      document.execCommand(tool.cmd, false, null);
    }
    emit();
  };

  return (
    <div className="rte">
      <div className="rte__toolbar">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <button
              key={i}
              type="button"
              className="rte__btn"
              title={tool.title}
              aria-label={tool.title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(tool);
              }}
            >
              <Icon size={16} strokeWidth={1.9} />
            </button>
          );
        })}
      </div>
      <div
        ref={ref}
        className="rte__area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "İçeriği buraya yazın…"}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
