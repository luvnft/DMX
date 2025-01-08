import React from 'react';

const Home = ({ onRouteChange }) => {
  return (
    <div className='flex items-center justify-center h-screen text-white'>
      <div className='text-center'>
        <h1 className='text-6xl font-semibold'>
          Mint and Play<br />
          <span className='font-thin text-sky-400'>XRPL Music NFTs</span>
        </h1>
        <button 
          onClick={() => onRouteChange("Mint")}
          type="button" 
          className="text-white mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Mint
        </button>
      </div>
    </div>
  );
}

export default Home;