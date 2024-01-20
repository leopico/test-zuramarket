import {
  useAddress,
  useContract,
  useOwnedNFTs,
  useValidDirectListings,
  useValidEnglishAuctions,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Container from "../../components/Container/Container";
import ListingWrapper from "../../components/ListingWrapper/ListingWrapper";
import NFTGrid from "../../components/NFT/NFTGrid";
import Skeleton from "../../components/Skeleton/Skeleton";
import {
  MARKETPLACE_ADDRESS,
  NFT_COLLECTION_ADDRESS,
} from "../../const/contractAddresses";
import styles from "../../styles/Profile.module.css";
import randomColor from "../../util/randomColor";
import Link from "next/link";
import { GiSplitCross } from "react-icons/gi";

const [randomColor1, randomColor2, randomColor3, randomColor4] = [
  randomColor(),
  randomColor(),
  randomColor(),
  randomColor(),
];

export default function ProfilePage() {
  const [showExportPrivateKey, setShowExportPrivateKey] = useState(false);
  const router = useRouter();
  const address = useAddress();
  const adminAddress = process.env.NEXT_PUBLIC_ADMINADDRESS;
  const [tab, setTab] = useState<"nfts" | "listings" | "auctions">("nfts");

  const { contract: nftCollection } = useContract(NFT_COLLECTION_ADDRESS);

  const { contract: marketplace } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace-v3"
  );

  const { data: ownedNfts, isLoading: loadingOwnedNfts } = useOwnedNFTs(
    nftCollection,
    router.query.address as string
  );

  const { data: directListings, isLoading: loadingDirects } =
    useValidDirectListings(marketplace, {
      seller: router.query.address as string,
    });

  const { data: auctionListings, isLoading: loadingAuctions } =
    useValidEnglishAuctions(marketplace, {
      seller: router.query.address as string,
    });

  const openModal = () => {
    setShowExportPrivateKey(true);
  };

  const closeModal = () => {
    setShowExportPrivateKey(false);
  }

  return (
    <>
      <Container maxWidth="lg">
        <div className={styles.profileHeader}>
          <div
            className={styles.coverImage}
            style={{
              background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
            }}
          />
          <div
            className={styles.profilePicture}
            style={{
              background: `linear-gradient(90deg, ${randomColor3}, ${randomColor4})`,
            }}
          />
          <div className="flex justify-between items-center">
            <h1 className={styles.profileName}>
              {router.query.address ? (
                router.query.address.toString().substring(0, 4) +
                "..." +
                router.query.address.toString().substring(38, 42)
              ) : (
                <Skeleton width="320" />
              )}
            </h1>

            <button
              onClick={openModal}
              className="mr-5 md:mr-7 text-sm md:text-md font-semibold
             bg-blue-cus px-2 md:px-3 py-1 md:py-2 rounded hover:bg-blue-cus/90"
            >
              Export Key
            </button>
          </div>
        </div>
        <div className={styles.tabs}>
          <h3
            className={`${styles.tab} 
        ${tab === "nfts" ? styles.activeTab : ""}`}
            onClick={() => setTab("nfts")}
          >
            NFTs
          </h3>

          {
            address === adminAddress && (
              <Link href="/sell">
                <h3 className={styles.tab}>Sell House</h3>
              </Link>
            )
          }

          {/* <h3
          className={`${styles.tab} 
        ${tab === "listings" ? styles.activeTab : ""}`}
          onClick={() => setTab("listings")}
        >
          Listings
        </h3>
        <h3
          className={`${styles.tab}
        ${tab === "auctions" ? styles.activeTab : ""}`}
          onClick={() => setTab("auctions")}
        >
          Auctions
        </h3> */}
        </div>

        <div
          className={`${tab === "nfts" ? styles.activeTabContent : styles.tabContent
            }`}
        >
          <NFTGrid
            data={ownedNfts}
            isLoading={loadingOwnedNfts}
            emptyText="Looks like you don't have any NFTs from this collection. Head to the buy page to buy some!"
          />
        </div>

        <div
          className={`${tab === "listings" ? styles.activeTabContent : styles.tabContent
            }`}
        >
          {loadingDirects ? (
            <p>Loading...</p>
          ) : directListings && directListings.length === 0 ? (
            <p>Nothing for sale yet! Head to the sell tab to list an NFT.</p>
          ) : (
            directListings?.map((listing) => (
              <ListingWrapper listing={listing} key={listing.id} />
            ))
          )}
        </div>

        <div
          className={`${tab === "auctions" ? styles.activeTabContent : styles.tabContent
            }`}
        >
          {loadingAuctions ? (
            <p>Loading...</p>
          ) : auctionListings && auctionListings.length === 0 ? (
            <p>Nothing for sale yet! Head to the sell tab to list an NFT.</p>
          ) : (
            auctionListings?.map((listing) => (
              <ListingWrapper listing={listing} key={listing.id} />
            ))
          )}
        </div>
      </Container>
      {
        showExportPrivateKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-0">
            <div className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-2xl">
              <button
                onClick={closeModal}
                className="absolute top-0 right-0 p-3 cursor-pointer text-gray-600 font-bold hover:text-gray-800"
              >
                <GiSplitCross />
              </button>
              <div className="flex flex-col space-y-5 frame">
                <p className=" text-gray-600 pt-5 text-sm font-bold text-center">
                  This key is for embedded wallets
                </p>
                <iframe
                  src={`https://withpaper.com/sdk/2022-08-12/embedded-wallet/export?clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`}
                  height="500"
                  width="100%"
                  title="Export Private Key"
                  loading="eager"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )
      }
    </>

  );
}
