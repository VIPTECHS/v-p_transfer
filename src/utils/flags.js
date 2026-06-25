const LOCAL_FLAGS = { "CY-N": "/images/flags/cy-n.png" };

export function flagUrl(code) {
  if (!code) return "";
  if (LOCAL_FLAGS[code]) return LOCAL_FLAGS[code];
  const c = code.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/24x18/${c}.png`;
}
