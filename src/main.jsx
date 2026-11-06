import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n/I18nContext";
import { ThemeProvider } from "./lib/ThemeContext";
import "./tailwind.css";
import "./styles.css";
import "./public-design.css";
import "./dark-theme.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <div className="public-ui"><App /></div>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
