/**
 * Telegram bildirimlerini doğrular:
 *   node server/scripts/test-telegram.mjs
 *
 * TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID ortam değişkenlerini okur, gruba
 * örnek bir mesaj atar. Gerçek kayıt oluşturmaz.
 */
import { sendTelegram, panelUrl } from "../lib/telegram.js";

const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN);
const hasChat = Boolean(process.env.TELEGRAM_CHAT_ID);

console.log(`TELEGRAM_BOT_TOKEN: ${hasToken ? "tanımlı" : "EKSİK"}`);
console.log(`TELEGRAM_CHAT_ID:   ${hasChat ? process.env.TELEGRAM_CHAT_ID : "EKSİK"}`);
console.log(`Panel URL:          ${panelUrl("/reservations")}`);

if (!hasToken || !hasChat) {
  console.error("\nEksik değişken var — .env dosyasını kontrol et.");
  process.exit(1);
}

const ok = await sendTelegram(
  [
    "🔧 <b>Test Bildirimi</b>",
    "",
    "VIP Transfer bildirim entegrasyonu çalışıyor.",
    "",
    `<a href="${panelUrl("/reservations")}">→ Panelde aç</a>`,
  ].join("\n"),
);

console.log(ok ? "\n✅ Mesaj gönderildi." : "\n❌ Gönderilemedi — yukarıdaki hataya bak.");
process.exit(ok ? 0 : 1);
