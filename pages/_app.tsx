import {
  ThirdwebProvider,
  coinbaseWallet,
  embeddedWallet,
  metamaskWallet,
  trustWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import type { AppProps } from "next/app";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import { NETWORK } from "../const/contractAddresses";
import Head from "next/head";
import "../styles/globals.css";
import "../styles/global.css";
import Footer from "../components/Footer/Footer";

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={NETWORK}
      sdkOptions={{
        gasless: {
          biconomy: {
            apiId: process.env.NEXT_PUBLIC_BICONOMY_APIID,
            apiKey: process.env.NEXT_PUBLIC_BICONOMY_APIKEY,
            deadlineSeconds: 3600,
          }
        }
      }}
      supportedWallets={[
        metamaskWallet(),
        embeddedWallet({ recommended: true }),
      ]}
    >
      <Head>
        <title>HOUSE - Zuraverse</title>
        {/* Add any other metadata, meta tags, or links you need */}
        <meta name="description" content="H.A.C.K is the gateway to Zuraverse. H.A.C.K NFTs introduce Zuraverse to the Web3 audience.
They are the stepping stone in the formation of Zuraverse." />
      </Head>
      {/* Progress bar when navigating between pages */}
      <NextNProgress
        color="var(--color-tertiary)"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />

      {/* Render the navigation menu above each component */}
      <Navbar />
      {/* Render the actual component (page) */}
      <Component {...pageProps} />
      <Footer />
    </ThirdwebProvider>
  );
}

export default MyApp;
