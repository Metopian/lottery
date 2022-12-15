## About Metopia & Metopian Luckydraw

Metopia is the platform which empowers non-financialized governance and provides Web3 communtity tools.
Metopian Luckydraw is built for community raffles and incentives.
[Example](https://luckydraw.metopia.xyz/)
[Learn more](https://metopia.xyz/)

## Background

When we are building connections with NFT communities, we saw plenty of community events which depend on randomness. However, in most cases we never have the oppotunities to know how the admins draw the event winners.
So we decided to build an on-chain tools which could utilize [Verifiable Randomness Function](https://vrf.chain.link/) to secure the safety & justice of those events.

## Knowledge

### VRF

Chainlink VRF ([Verifiable Randomness Function](https://vrf.chain.link/)) is a provably fair and verifiable random number generator (RNG) that enables smart contracts to access random values without compromising security or usability provided by Chainlink.

When a luckydraw triggers VRF, it consumes LINK and costs time for Chainlink to call
        
        function fulfillRandomWords(
            uint256 _requestId,
            uint256[] memory _randomWords
        )

As the result the **Draw Winners** behaviors of the users require more blocks to determine the event winners.

## Run the example

        yarn && yarn start
        
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


