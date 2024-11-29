const { ethers } = require("hardhat");

async function main() {
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    console.log("deployed at address: ", nft.target); 
}
main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
})