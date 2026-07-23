import sanitizeHtml from "sanitize-html";

// Whitelist tuned for editorial page content authored in the admin WYSIWYG.
// Scripts, styles, iframes, event handlers and javascript: URLs are stripped.
const OPTIONS = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr", "blockquote",
    "ul", "ol", "li", "strong", "b", "em", "i", "u", "s",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  // Keep inline styles minimal to avoid layout hijacking.
  allowedStyles: {
    "*": {
      "text-align": [/^left$|^right$|^center$|^justify$/],
      "font-weight": [/^bold$|^\d{3}$/],
      "font-style": [/^italic$/],
    },
  },
  transformTags: {
    // Force safe rel on links that open a new tab.
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.target === "_blank") {
        out.rel = "noopener noreferrer nofollow";
      }
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: attribs.loading || "lazy" },
    }),
  },
};

export function sanitizePageHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return sanitizeHtml(dirty, OPTIONS).trim();
}
