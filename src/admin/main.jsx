import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import "../tailwind.css";
import "./admin.css";

// Operasyon paneli kendi giriş noktası: public sitenin I18n/Theme
// sağlayıcılarına ve bileşenlerine bağlı değil, ayrı bir bundle olarak çıkar.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
