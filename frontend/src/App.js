import React, { useEffect, useState } from "react";
import NFT from "./contractData/contract-address.json";
import NFTArtifacts from "./contractData/NFT.json";
import { ethers } from "ethers";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { useSDK } from "@metamask/sdk-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./components/Home/Home";
import Mint from "./components/Mint/Mint";
import jws from "./contractData/key.json";
import { PinataSDK } from 'pinata-web3';
import Explore from "./components/Explore/Explore";

const pinata = new PinataSDK({
  pinataJwt: jws.jws,
  pinataGateway: "https://xrp.mypinata.cloud",
});

const App = () => {
  const [route, setRoute] = useState("home");
  const [wallet, setWallet] = useState(false);
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [shouldFetchNFTs, setShouldFetchNFTs] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [canPlay, setCanPlay] = useState(false);
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIspaying] = useState(false);
  const { sdk, provider, chainId} = useSDK();

  const XRLP_CHAIN_ID = "0x15f902";

  useEffect(() => {
    if (window.ethereum === undefined) {
      setWallet(false);
      console.error("Wallet not detected");
    } else {
      setWallet(true);
    }
  }, [])

  useEffect(() => {
    if(address) {
      console.log("chain Id", chainId);
      if(chainId !== XRLP_CHAIN_ID) {
        changeNetwork(XRLP_CHAIN_ID)
      }
    }
  }, [address, chainId])

  useEffect(() => {
    async function getAllNFTs() {
      if(connected && address) {
        try {
          setIsLoading(true);
          const totalCount = Number(await contract.getTotalCount());
          const nftDataArray = []; 
          for (let i=0; i< totalCount; i++) {
            const nftRes = await contract.getNftData(i);
            const response = await pinata.gateways.get(`https://xrp.mypinata.cloud/ipfs/${nftRes[3]}`);
            const { description, name, price, video } = response.data;

            const nftData = {
              id: nftRes[0].toString(),  
              owner: nftRes[1],              
              name: name,
              description: description,
              price: price,
              video: video,
              timeswatched: nftRes[4].toString(), 
            };
            nftDataArray.push(nftData);
          }

          setNfts(nftDataArray);
          setShouldFetchNFTs(false);
          setIsLoading(false);
        } catch (e) {
          toast.error("error fetching NFTs", {
            pauseOnHover: false,
            position: "top-center"
          })
          console.log(e);
        }
      }
    }
    getAllNFTs();
  }, [shouldFetchNFTs, connected, address, contract])

  const changeNetwork = async (hexChainId) => {
    try {
      toast.info("Switchin Network", {
        pauseOnHover: false,
        position: "top-center"
      })
      await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: hexChainId}],
      }) 
    } catch (err) {
      console.log(err);
      addXRPLNetwork()
    }
  }

  const addXRPLNetwork = () => {

    if(!provider) {
      throw new Error("Invalid Ethereum Provider");
    }

    toast.info("Adding XRLP Network on Metamask", {
      pauseOnHover: false,
      position: "top-center",
    })
    provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: XRLP_CHAIN_ID,
          chainName: "XRPL EVM Sidechain Devnet",
          blockExplorerUrls: ["https://explorer.xrplevm.org/"],
          nativeCurrency: {
            symbol: "XRPL",
            decimals: 18,
          },
          rpcUrls: ["https://rpc-evm-sidechain.xrpl.org"]
        },
      ],
    })
    .then((res) => console.log("add", res))
    .catch((e) => console.log("error", e));
  }

  const onRouteChange = (route) => {
    setRoute(route);
  }

  const onConnect = async () => {
    try {
      const accounts = await sdk?.connect();
      const web3Provider = new ethers.BrowserProvider(provider);
      const signer = await web3Provider.getSigner();
      const _contract = new ethers.Contract(
        NFT.NFT,
        NFTArtifacts.abi,
        signer
      );

      setContract(_contract);
      setAddress(accounts?.[0]);
      setConnected(true);
    } catch (error) {
      console.log(error);
    }
  }

  const uploadToPinata = async (file, name, description, price) => {
    if (!file) {
      throw new Error("File is required");
    }

    try {
      toast.info("Uploading video to IPFS", {
        position:"top-center"
      })
      const uploadImage = await pinata.upload.file(file);
      const metadata = await pinata.upload.json({
        name: name,
        description: description,
        video: `https://xrp.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`,
        price: price
      });

      return metadata.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("Minting NFT failed.", {
        position: "top-center"
      });
      throw new Error("Upload to Pinata failed.");
    }
  };

  const mintNFT = async (uri, price) => {
    if( !address &&  !connected) return;

    try {
      toast.info("Minting NFTs...", {
        pauseOnFocusLoss: false,
        pauseOnHover: false,
        position: "top-center"
      });
      const priceInWei = ethers.parseEther(price)
      const tx = await contract.mint(priceInWei, uri);
      const res =   await tx.wait()
      if(res.status) {
        toast.info("Minted! sending to Home page", {
          pauseOnHover: false,
          position: "top-center"
        })
        setShouldFetchNFTs(true)
        onRouteChange("home");
      } 
    } catch (e) {
      console.log(e);
    }
  }

  const handlePay = async (id, uri, price) => {
    if (!address) return;
    console.log(price)

    try {
      setIspaying(true);
      toast.info("Please wait while transaction processing", {
        pauseOnFocusLoss: false,
        position: "top-center",
      })
      const priceInWei = ethers.parseEther(price.toString());
      const tx = await contract.rent(id, { value: priceInWei});
      const res = await tx.wait();

      if(res.status) {
        toast.success("Please enjoy", {
          position: "top-center"
        });

        console.log("herer")

        setCanPlay(true);
        setUrl(uri);
      }
    } catch (e) {
      console.log(e);
      toast.error('Error paying NFT:', {
        position: "top-center"
      });
    } finally {
      setIspaying(false);
    }
  }

  const handleCloseVideo = () => {
    setCanPlay(false);
    setUrl(null);
  }
  
  return (
    <div>
      <ToastContainer />
      <div className="min-h-screen App">
        <div className="w-screen h-screen gradient-bg-welcome">
            <Navbar 
              onRouteChange={onRouteChange}
              connect={onConnect}
              address={address}
              wallet={wallet}
              connected={connected}
            />
            {route === "home" ? (
              <Home onRouteChange={onRouteChange} />
            ) : route === "explore" ? (
              < Explore nfts={nfts} isConnected={connected} isLoading={isLoading} canPlay={canPlay} handlePay={handlePay} url={url} handleCloseVideo={handleCloseVideo} isPaying={isPaying}/>
            ) : route === "mint" ? (
              < Mint uploadToPinata={uploadToPinata} mintNFT={mintNFT}/>
            ) : (
              <>Cannot find page</>
            )}
        </div>
      </div>
    </div>
  )
}

export default App;