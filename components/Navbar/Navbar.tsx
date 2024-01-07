import { ConnectWallet, darkTheme, useAddress } from "@thirdweb-dev/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

/**
 * Navigation bar that shows up on all pages.
 * Rendered in _app.tsx file above the page content.
 */
export function Navbar() {
  const address = useAddress();

  const customTheme = darkTheme({
    fontFamily: 'Futura',
    colors: {
      modalBg: "#1b1d22",
      primaryText: "#fff",
      walletSelectorButtonHoverBg: "#736969",
      borderColor: "#31333a",
      separatorLine: "#49516e",
      success: "#5bb98c",
      danger: "#e54d2e"
    }
  })

  return (
    <section className="bg-[#191c1f] sticky top-0 z-30 shadow-sm ">
      <div className="container mx-auto px-4 sm:px-7 py-5">
        <nav className=" flex justify-end sm:justify-between items-center">

          <div className={`${styles.profileImage} hidden sm:block`}>
            <Link href="/" passHref>
              <div className="flex flex-col items-center text-white">
                <div className="w-full text-center font-extrabold text-2xl tracking-tighter" style={{ marginBottom: '-0.1rem' }}>
                  ZURAVERSE
                </div>
                <div className="w-full text-center text-lg font-extralight tracking-widest" style={{ marginTop: '-0.5rem' }}>
                  MARKETPLACE
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden sm:block">
            <Link href="https://zuraverse.xyz/" target="_blink" className="">
              <div className={`${styles.profileImage} hidden sm:block`}>
                <Image
                  src="/images/navbar_icon.jpg"
                  width={50}
                  height={50}
                  alt="NFT marketplace sample logo"
                />
              </div>
            </Link>
          </div>

          <div className="flex space-x-2">
            <div className="">
              <ConnectWallet
                theme={customTheme}
                modalSize={"compact"}
                btnTitle="Sign In"
                modalTitle="WELCOME"
                modalTitleIconUrl="/images/navbar_icon.jpg"
                switchToActiveChain={true}
                auth={{
                  loginOptional: false,  
                }}
              />
            </div>
            {address && (
              <Link className={styles.link} href={`/profile/${address}`}>
                <Image
                  className={styles.profileImage}
                  src="/user-icon.png"
                  width={42}
                  height={42}
                  alt="Profile"
                />
              </Link>
            )}
          </div>

        </nav>
      </div>
    </section>
  );
}
