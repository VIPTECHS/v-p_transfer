import { Fragment } from "react";

// Bağımlılıksız, güvenli (innerHTML yok) küçük markdown çevirici:
// başlık, **kalın**, `kod`, ``` blok ```, liste, tablo, paragraf.
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={`${keyBase}-${i}`}>{tok.slice(2, -2)}</strong>);
    else parts.push(<code key={`${keyBase}-${i}`}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const splitRow = (line) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isSep = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

export default function AiMarkdown({ text }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(<pre key={k++}><code>{buf.join("\n")}</code></pre>);
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      out.push(
        <div className="ai-md-table" key={k++}>
          <table>
            <thead><tr>{head.map((h, c) => <th key={c}>{inline(h, `h${c}`)}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c, `c${ri}-${ci}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      out.push(<p className="ai-md-h" key={k++}>{inline(heading[2], `hd${k}`)}</p>);
      i += 1;
      continue;
    }

    if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
        i += 1;
      }
      const Tag = ordered ? "ol" : "ul";
      out.push(
        <Tag key={k++}>{items.map((it, n) => <li key={n}>{inline(it, `li${k}-${n}`)}</li>)}</Tag>,
      );
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*([-*•]|\d+[.)])\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(
      <p key={k++}>
        {para.map((p, n) => (
          <Fragment key={n}>{n > 0 && <br />}{inline(p, `p${k}-${n}`)}</Fragment>
        ))}
      </p>,
    );
  }
  return <div className="ai-md">{out}</div>;
}

/** Sesli okuma için işaretlemeyi sadeleştirir. */
export function plainForSpeech(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?/g, " ")
    .replace(/[*`#|_>]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
