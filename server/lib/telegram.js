/**
 * Telegram bildirimleri.
 *
 * Tek yönlü: sunucudan Telegram'a giden bir istek. Gelen webhook yok, bu
 * yüzden dışarıya açılan yeni bir yüzey oluşturmuyor.
 *
 * Bu modüldeki hiçbir fonksiyon hata fırlatmaz — bildirim, tetikleyen işlemi
 * (rezervasyon kaydı gibi) hiçbir koşulda düşürmemeli.
 */

const API_BASE = "https://api.telegram.org";
const TIMEOUT_MS = 5000;

let missingConfigWarned = false;

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    if (!missingConfigWarned) {
      console.log(
        "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID tanımlı değil — bildirimler kapalı.",
      );
      missingConfigWarned = true;
    }
    return null;
  }
  return { token, chatId };
}

/** parse_mode=HTML ile gönderdiğimiz için kullanıcı verisi kaçırılmalı. */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Mesajı gönderir. Çağıran tarafın beklemesi gerekmez; hata durumunda
 * yalnızca log'a yazar ve false döner.
 */
export async function sendTelegram(text) {
  const config = getConfig();
  if (!config) return false;

  try {
    const response = await fetch(`${API_BASE}/bot${config.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Telegram hatayı gövdede açıklar (yanlış chat_id, bot gruptan atılmış vb.)
      const detail = await response.text().catch(() => "");
      console.error(`[telegram] gönderilemedi (${response.status}): ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[telegram] gönderilemedi: ${error.message}`);
    return false;
  }
}

/**
 * Bildirimi arka planda gönderir — API yanıtını geciktirmemesi için.
 * Bilinçli olarak beklenmiyor.
 */
export function sendTelegramInBackground(text) {
  void sendTelegram(text);
}

/** Panel kayıt linki. Subdomain ayrı olduğu için tam URL gerekiyor. */
export function panelUrl(path = "") {
  const base = (process.env.PANEL_URL || "https://operasyon.viptransfer.com").replace(/\/$/, "");
  return `${base}${path}`;
}
