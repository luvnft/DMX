import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MetaMaskProvider } from "@metamask/sdk-react";
import "./index.css"

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <MetaMaskProvider
      sdkOptions={{
        dappMetadata: {
          name: "XRLP NFT Dapp",
          url: window.location.href,
        }
      }}
    >
      <App />
    </MetaMaskProvider>
  </React.StrictMode>
);