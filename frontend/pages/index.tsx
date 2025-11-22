import Head from "next/head";
import WalletConnect from "../components/WalletConnect";
import StakingCard from "../components/StakingCard";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Yaroslav Staking Vault</title>
        <meta name="description" content="Stake YARO tokens and earn rYARO rewards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <h1>Yaroslav Staking Vault</h1>
        <p>Stake your YARO tokens and earn rYARO rewards!</p>

        <div style={{ marginBottom: "20px" }}>
          <Link href="/admin" style={{ color: "#0070f3", textDecoration: "underline" }}>
            Admin Panel
          </Link>
        </div>

        <WalletConnect />
        <StakingCard />
      </main>
    </>
  );
}

