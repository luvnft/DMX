require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    xrpl: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      accounts: ["f6fd6a3467cf27f80b88a8b6d614c817bba95cc879068724ba4a572ee9102e54"],
      chainId: 1440002,
    },
  },
};
