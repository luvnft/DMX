import React from "react";
import Card from "../Card/Card";

const CardList = ({ userNFTs, handlePay, isPlaying, isPaying }) => {

  let cardComponents = [];
  if (userNFTs) {
    cardComponents = userNFTs.map((nft) => {
      return (
        <Card
          key={nft.id}
          id={nft.id}
          owner={nft.owner}
          name={nft.name}
          description={nft.description}
          video={nft.video}
          price={nft.price}
          seen={nft.timeswatched}
          handlePay={handlePay}
          isPlaying={isPlaying}
          isPaying={isPaying}
        />
      );
    });
  }

  return (
    <div>
      {userNFTs.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className='flex flex-wrap gap-10 justify-center pb-5'>
          {cardComponents}
        </div>
      )}
    </div>
  );
};

export default CardList;
