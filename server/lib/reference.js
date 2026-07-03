export function generateReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VIP-${stamp}${rand}`;
}

let _reservationSeq = 0;
export function generateReservationReference() {
  const year = new Date().getFullYear();
  const ts = Date.now().toString().slice(-6);
  const seq = String(++_reservationSeq).padStart(2, "0");
  return `RZV-${year}-${ts}${seq}`.slice(0, 18);
}
