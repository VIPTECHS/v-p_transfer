import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCustomer } from "../api/admin";
import LedgerStatement from "./components/LedgerStatement";

export default function CustomerDetail({ id, onBack }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetchCustomer(id).then(setCustomer).catch(() => {});
  }, [id]);

  if (!customer) return <div className="admin-loading">Yükleniyor...</div>;

  return (
    <>
      <div className="admin-detail-header">
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onBack}><ArrowLeft size={14} /> Geri</button>
        <h1>{customer.firstName} {customer.lastName || ""}</h1>
      </div>
      <LedgerStatement entityType="customer" entityId={id} />
    </>
  );
}
