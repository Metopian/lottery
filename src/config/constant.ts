
const chainMap = {
    '0x4': 'Rinkeby',
    '0x1': 'Ethereum',
    '0x3': 'Ropsten',
    '0x5': 'Goerli',
    '0x2a': 'Kovan',
    '0x89': 'Polygon',
    '0x13881': 'Mumbai',
    '0x38': 'BNB Chain',
    '0x61': 'BSC Testnet',
    '0xa86a': 'Avalanche',
    '0xfa': 'Fantom',
}
const chainRpcMap = {
    '0x1': 'https://mainnet.infura.io/v3/',
    '0x4': 'https://rinkeby.infura.io/v3/',
    '0x5': 'https://goerli.infura.io/v3/',
    '0x38': 'https://bscrpc.com', // 56
    '0x89': 'https://polygon-rpc.com/',
    '0x61': 'https://bsctestapi.terminet.io/rpc',
}

const chainExplorerMap = {
    '0x1': 'https://etherscan.io/address/',
    '0x4': 'https://rinkeby.etherscan.io/address/',
    '0x5': 'https://goerli.etherscan.io/address/',
    '0x89': 'https://polygonscan.com/address/',
    '0x38': 'https://bscscan.com/address/', // 56
    '0x61': 'https://testnet.bscscan.com/address/',
}
const currencyMap = {
    '0x1': 'ETH',
    '0x4': 'ETH',
    '0x5': 'ETH',
    '0x89': 'MATIC',
    '0x38': 'BNB', // 56
    '0x61':'tBNB'
}


export { currencyMap, chainMap, chainExplorerMap, chainRpcMap }
