// lib/networkConfig.ts
import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        crowdfundingPackageId:
          "0xc135c7f84c9e7f0d88368879afdcf61da44ed5f1277354122d22741a5dba5528",
      },
    },
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        crowdfundingPackageId: "0x0", // not deployed here
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        crowdfundingPackageId: "0x0", // not deployed here
      },
    },
  });

export { networkConfig, useNetworkVariable, useNetworkVariables };
