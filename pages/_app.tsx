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
      clientId= {"f268fc3c482cf7c2d34decae0cc9e2e6"}
      activeChain= {NETWORK} 
      sdkOptions={{
        gasless: {
          biconomy: {
            apiId: "vAALwwgpz.03e4b3cc-58bb-4203-85e7-6784320c62b2",
            apiKey: "30c4b95f-8a1c-4c78-bb2a-945a6b132285",
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
