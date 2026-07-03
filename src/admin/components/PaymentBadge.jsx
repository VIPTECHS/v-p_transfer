const LABELS = {
  paid: "Ödendi",
  partial: "Kısmi",
  unpaid: "Ödenmedi",
};

export default function PaymentBadge({ status }) {
  return (
    <span className={`payment-badge payment-badge--${status || "unpaid"}`}>
      {LABELS[status] || LABELS.unpaid}
    </span>
  );
}
