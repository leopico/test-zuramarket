import {
  MediaRenderer,
  ThirdwebNftMedia,
  useActiveClaimCondition,
  useAddress,
  useContract,
  useContractEvents,
  useOwnedNFTs,
  useValidDirectListings,
  useValidEnglishAuctions,
  Web3Button,
} from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import Container from "../../../components/Container/Container";
import { GetStaticProps, GetStaticPaths } from "next";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  ETHERSCAN_URL,
  MARKETPLACE_ADDRESS,
  NETWORK,
  NFT_COLLECTION_ADDRESS,
} from "../../../const/contractAddresses";
import styles from "../../../styles/Token.module.css";
import Link from "next/link";
import randomColor from "../../../util/randomColor";
import Skeleton from "../../../components/Skeleton/Skeleton";
import toast, { Toaster } from "react-hot-toast";
import toastStyle from "../../../util/toastConfig";
import { ethers } from "ethers";
import { GiSplitCross } from "react-icons/gi";
import axios from "axios";

type Props = {
  nft: NFT;
  contractMetadata: any;
};

const [randomColor1, randomColor2] = [randomColor(), randomColor()];

export default function TokenPage({ nft, contractMetadata }: Props) {
  const [bidValue, setBidValue] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [isAddressInList, setIsAddressInList] = useState<boolean | null>(false);
  const [ownedNft, setOwnedNft] = useState<number>(0);
  const address: string | undefined = useAddress();
  const [updateUI, setUpdateUI] = useState<boolean>(false);
  // console.log(address);

  console.log(isAddressInList);

  // Connect to marketplace smart contract
  const { contract: marketplace, isLoading: loadingContract } = useContract(
    MARKETPLACE_ADDRESS,
    "marketplace-v3"
  );

  // Connect to NFT Collection smart contract
  const { contract: nftCollection } = useContract(NFT_COLLECTION_ADDRESS);

  //start mint logic here we go (This is modification one)
  const { data: claimPhase, isLoading: loadingClaimPhase } = useActiveClaimCondition(nftCollection, nft.metadata.id);
  // console.log(claimPhase);

  const { data: ownedNfts, isLoading: loadingOwnedNfts } = useOwnedNFTs(
    nftCollection,
    address
  );


  //end mint logic here we go (This is modification one)

  const { data: directListing, isLoading: loadingDirect } =
    useValidDirectListings(marketplace, {
      tokenContract: NFT_COLLECTION_ADDRESS,
      tokenId: nft.metadata.id,
    });

  // 2. Load if the NFT is for auction
  const { data: auctionListing, isLoading: loadingAuction } =
    useValidEnglishAuctions(marketplace, {
      tokenContract: NFT_COLLECTION_ADDRESS,
      tokenId: nft.metadata.id,
    });

  // Load historical transfer events: TODO - more event types like sale
  const { data: transferEvents, isLoading: loadingTransferEvents } =
    useContractEvents(nftCollection, "Transfer", {
      queryFilter: {
        filters: {
          tokenId: nft.metadata.id,
        },
        order: "desc",
      },
    });

  async function createBidOrOffer() {
    let txResult;
    if (!bidValue) {
      toast(`Please enter a bid value`, {
        icon: "❌",
        style: toastStyle,
        position: "bottom-center",
      });
      return;
    }

    if (auctionListing?.[0]) {
      txResult = await marketplace?.englishAuctions.makeBid(
        auctionListing[0].id,
        bidValue
      );
    } else if (directListing?.[0]) {
      txResult = await marketplace?.offers.makeOffer({
        assetContractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: nft.metadata.id,
        totalPrice: bidValue,
      });
    } else {
      throw new Error("No valid listing found for this NFT");
    }

    return txResult;
  };

  async function buyListing() {
    let txResult;

    if (auctionListing?.[0]) {
      txResult = await marketplace?.englishAuctions.buyoutAuction(
        auctionListing[0].id
      );
    } else if (directListing?.[0]) {
      txResult = await marketplace?.directListings.buyFromListing(
        directListing[0].id,
        1
      );
    } else {
      throw new Error("No valid listing found for this NFT");
    }
    return txResult;
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const quantityOwnedString = ownedNfts?.[0]?.quantityOwned;

    if (quantityOwnedString !== undefined && typeof quantityOwnedString === 'string') {
      const parsedNft = parseInt(quantityOwnedString, 10);
      setOwnedNft(parsedNft);
    } else {
      console.error("Invalid or undefined quantityOwned");
      setOwnedNft(0);
    }

  }, [ownedNfts]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await axios.get("/api/get_addresses").then((res) => res.data);

        // console.log("Addresses:", addresses);

        if (address && typeof address === 'string') {
          const isAddressInList = addresses.some((item: any) =>
            item.address.toLowerCase() === address.toLowerCase()
          );

          setIsAddressInList(isAddressInList);
        } else {
          console.error("Invalid or undefined address");
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, [address, updateUI]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await axios.post(`/api/submit_email`, { email, address });

      if (response.status === 201) {
        toast("Email submitted successfully", {
          icon: "✅",
          style: toastStyle,
          position: "bottom-center",
        });
        setLoader(false);
        setEmail("");
        setIsOpen(false);
        setUpdateUI(true);
      }

    } catch (error) {
      setLoader(false);
      setEmail("");
      setIsOpen(false);
      console.error("Error:", error);
      toast(`Email already exists!`, {
        icon: "❌",
        style: toastStyle,
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <Container maxWidth="lg">
        <div className={styles.container}>
          <div className={styles.metadataContainer}>
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.image}
            />

            <div className={styles.descriptionContainer}>
              <h3 className={styles.descriptionTitle}>Description</h3>
              <p className={styles.description}>{nft.metadata.description}</p>
              <h3 className={styles.descriptionTitle}>Traits</h3>
              <div className={styles.traitsContainer}>
                {/* @ts-ignore */}
                {nft?.metadata?.attributes.map((attribute, index) => (
                  <div className={styles.traitContainer} key={index}>
                    <p className={styles.traitName}>{attribute.trait_type}</p>
                    <p className={styles.traitValue}>{attribute.value.toString() || ""}</p>
                  </div>
                ))}
              </div>
              <h3 className={styles.descriptionTitle}>History</h3>
              <div className={styles.traitsContainer}>
                {transferEvents?.map((event, index) => (
                  <div
                    key={event.transaction.transactionHash}
                    className={styles.eventsContainer}
                  >
                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>Event</p>
                      <p className={styles.traitValue}>
                        {
                          // if last event in array, then it's a mint
                          index === transferEvents.length - 1
                            ? "Mint"
                            : "Transfer"
                        }
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>From</p>
                      <p className={styles.traitValue}>
                        {event.data.from?.slice(0, 4)}...
                        {event.data.from?.slice(-2)}
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <p className={styles.traitName}>To</p>
                      <p className={styles.traitValue}>
                        {event.data.to?.slice(0, 4)}...
                        {event.data.to?.slice(-2)}
                      </p>
                    </div>

                    <div className={styles.eventContainer}>
                      <Link
                        className={styles.txHashArrow}
                        href={`${ETHERSCAN_URL}/tx/${event.transaction.transactionHash}`}
                        target="_blank"
                      >
                        ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.listingContainer}>
            {contractMetadata && (
              <div className={styles.contractMetadataContainer}>
                <MediaRenderer
                  src={contractMetadata.image}
                  className={styles.collectionImage}
                />
                <p className={styles.collectionName}>{contractMetadata.name}</p>
              </div>
            )}
            <h1 className={styles.title}>{nft.metadata.name}</h1>
            <p className={styles.collectionName}>Token ID #{nft.metadata.id}</p>

            <Link
              href={`/profile/${nft.owner}`}
              className={styles.nftOwnerContainer}
            >
              {/* Random linear gradient circle shape */}
              <div
                className={styles.nftOwnerImage}
                style={{
                  background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
                }}
              />
              <div className={styles.nftOwnerInfo}>
                <p className={styles.label}>Current Owner</p>
                <p className={styles.nftOwnerAddress}>
                  {nft.owner.slice(0, 8)}...{nft.owner.slice(-4)}
                </p>
              </div>
            </Link>

            {/*start modification for mint logic */}
            <div className={styles.pricingContainer}>
              {/* Pricing information */}
              <div className={styles.pricingInfo}>
                {
                  !loadingClaimPhase ? (
                    claimPhase && (
                      <div>
                        <p><span className={styles.label}>Phase name</span>: {claimPhase.metadata?.name}</p>
                        <p><span className={styles.label}>Supply</span>: {claimPhase.availableSupply}</p>
                        <p><span className={styles.label}>Maximum claimable per wallet</span>: {claimPhase.maxClaimablePerWallet}</p>
                        <p><span className={styles.label}>Current Minted</span>: {claimPhase.currentMintSupply}</p>
                        <p><span className={styles.label}>Price</span>: {ethers.utils.formatUnits(claimPhase.price)}{" " + claimPhase.currencyMetadata.symbol}</p>
                      </div>
                    )
                  ) : (
                    <Skeleton width="120" height="57" />
                  )
                }
                <div className="pt-3">
                  {!loadingOwnedNfts ? (
                    ownedNft >= 1 ? (
                      <div className="bg-slate-300 rounded-lg text-center text-slate-700 w-full px-2 py-3">
                        Can&#39;t claim more than the maximum allowed quantity
                      </div>
                    ) : (
                      isAddressInList ? (
                        <Web3Button
                          contractAddress={NFT_COLLECTION_ADDRESS}
                          action={(nftContract) => nftContract.erc1155.claim(nft.metadata.id, 1)}
                          className={styles.btn}
                          onSuccess={() => {
                            toast(`Success!`, {
                              icon: "✅",
                              style: toastStyle,
                              position: "bottom-center",
                            });
                          }}
                          onError={() => {
                            toast(`You cannot mint properly!`, {
                              icon: "❌",
                              style: toastStyle,
                              position: "bottom-center",
                            });
                          }}
                        >
                          Claim House NFT
                        </Web3Button>
                      ) : (
                        <div>
                          <button
                            onClick={openModal}
                            className={`${styles.btn} rounded-lg bg-[#fff] text-gray-600 py-2`}
                          >
                            Submit your mail
                          </button>
                        </div>
                      )
                    )
                  ) : (
                    <Skeleton width="120" height="57" />
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      {
        isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-xl md:w-1/2">
              <button
                onClick={closeModal}
                className="absolute top-0 right-0 p-3 cursor-pointer text-gray-600 font-bold hover:text-gray-800"
              >
                <GiSplitCross />
              </button>
              <div className="flex flex-col space-y-7">
                <p className=" text-gray-600 pt-5 text-sm font-bold">Submit your mail address for this NFT</p>
                <form
                  className="flex flex-col items-end"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 p-2 rounded-lg bg-white border border-gray-500 text-gray-600 w-full"
                  />
                  <button className="bg-gray-700 text-white py-2 px-4 rounded mt-7">
                    {
                      loader ? "loading..." : "submit"
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const tokenId = context.params?.tokenId as string;

  const sdk = new ThirdwebSDK(NETWORK, {
    secretKey: process.env.TW_SECRET_KEY,
  });

  const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);

  const nft = await contract.erc1155.get(tokenId);

  let contractMetadata;

  try {
    contractMetadata = await contract.metadata.get();
  } catch (e) { }

  return {
    props: {
      nft,
      contractMetadata: contractMetadata || null,
    },
    revalidate: 1, // https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const sdk = new ThirdwebSDK(NETWORK, {
    secretKey: process.env.TW_SECRET_KEY,
  });

  const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);

  const nfts = await contract.erc1155.getAll();

  const paths = nfts.map((nft) => {
    return {
      params: {
        contractAddress: NFT_COLLECTION_ADDRESS,
        tokenId: nft.metadata.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};
