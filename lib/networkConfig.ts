// lib/networkConfig.ts
import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        crowdfundingPackageId:
          "0xa2fa1aa78581095d51a1396cd9d988098fdc87ec33b03a4715fbeb53fa30a963",
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
