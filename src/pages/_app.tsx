// src/pages/_app.tsx
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/custom.css";
import Layout from "../components/Layout";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  // Ensure Bootstrap JS bundle (for navbar toggler, modals, etc.)
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;