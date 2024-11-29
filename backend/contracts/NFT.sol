// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.26;

contract NFT {
    address private owner;
    uint256 private tokenCounter;

    struct NftData {
        uint256 tokenId;
        address owner;
        uint256 price;
        string uri;
        uint256 timeRented;
    }

    mapping (uint256 => NftData) private Nfts;

    constructor () {
        owner = msg.sender;
    }

    function mint(uint256 _price, string memory _uri) external {

        address sender = msg.sender;

        Nfts[tokenCounter] = NftData({
            tokenId: tokenCounter,
            owner: sender,
            price: _price,
            uri: _uri,
            timeRented: 0
        });

        tokenCounter++;
    }

    function rent(uint256 _index) external  payable  {
        require(_index < tokenCounter, "Invalid index");

        NftData storage nft = Nfts[_index];
        require(msg.value >= nft.price, "No enough eth received");

        payable(nft.owner).transfer(msg.value);

        nft.timeRented++;
    }

    function getTotalCount() public view returns(uint256) {
        return tokenCounter;
    }

    function getNftData(uint256 _index) public view returns (NftData memory) {
        require(_index < tokenCounter, "Invalid index");

        return Nfts[_index];
    }
}