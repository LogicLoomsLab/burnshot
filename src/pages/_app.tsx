// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/custom.css";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  // Ensure Bootstrap JS bundle (for navbar toggler, modals, etc.)
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>
      <Head>
        <script
          defer
          data-domain="burnshot.vercel.app"
          src="https://plausible.io/js/script.js"
        />
      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;