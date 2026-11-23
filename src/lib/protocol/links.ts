export const ARVO_TOKEN="0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";
export const ARVO_PAIR="0xb9b1139C812F4c9d0F3eC1dd502560777118E0E0";
export const protocolLinks={buy:`https://app.uniswap.org/explore/tokens/robinhood/${ARVO_TOKEN}`,dex:`https://dexscreener.com/robinhood/${ARVO_PAIR}`,token:`https://robinhoodchain.blockscout.com/token/${ARVO_TOKEN}`,x:"https://x.com/arvo_protocol",telegram:"https://t.me/arvo_protocol"};
export function stakingNetwork(chainId:number|null){return chainId===4663?{label:"Mainnet",explorer:"https://robinhoodchain.blockscout.com"}:chainId===46630?{label:"Testnet",explorer:"https://explorer.testnet.chain.robinhood.com"}:chainId?{label:`Chain ${chainId}`,explorer:null}:{label:"Preview",explorer:null};}
