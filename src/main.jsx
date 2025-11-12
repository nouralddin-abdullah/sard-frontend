import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import i18n from "./i18n.js";

const queryClient = new QueryClient();

// ensureDevToken(); // Commented out for testing

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <Toaster 
            position="bottom-right"
            dir="rtl"
            toastOptions={{
              style: {
                background: '#2C2C2C',
                color: '#FFFFFF',
                border: '1px solid #5A5A5A',
              },
              className: 'noto-sans-arabic-medium',
              success: {
                style: {
                  background: '#2C2C2C',
                  color: '#FFFFFF',
                  border: '1px solid #0077FF',
                },
                className: 'noto-sans-arabic-medium',
                iconTheme: {
                  primary: '#0077FF',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                style: {
                  background: '#2C2C2C',
                  color: '#FFFFFF',
                  border: '1px solid #FF4444',
                },
                className: 'noto-sans-arabic-medium',
                iconTheme: {
                  primary: '#FF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          <App />
        </QueryClientProvider>
      </I18nextProvider>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
