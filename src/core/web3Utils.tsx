
import { Web3Provider } from '@ethersproject/providers';
import { ethers, utils } from "ethers";
import { chainExplorerMap, chainMap, chainRpcMap, currencyMap } from "../config/constant";

export const getProvider = (wallet): Web3Provider => {
    if (wallet) {
        return new ethers.providers.Web3Provider(
            wallet.provider,
            'any'
        )
    } else {
        return null
    }
}

export const addChain = (chainId, provider: Web3Provider) => {
    let _chainId = '0x' + parseInt(chainId).toString(16)
    return provider.send("wallet_addEthereumChain", [
        {
            chainId: _chainId,
            rpcUrls: [chainRpcMap[_chainId]],
            chainName: chainMap[_chainId],
            nativeCurrency: {
                name: currencyMap[_chainId],
                symbol: currencyMap[_chainId],
                decimals: 18
            },
            blockExplorerUrls: [chainExplorerMap[_chainId]]
        }]
    )
}

export const switchChain = (chain: string, provider: Web3Provider) => {
    let chainId = '0x' + (parseInt(chain) || 1).toString(16)
    return provider && provider.send("wallet_switchEthereumChain", [
        { chainId }]
    ).catch(e => {
        if (e.code === 4902) {
            addChain(chainId, provider)
        }
    })
}

export const hashWithPrefix = (msg) => {
    return utils.keccak256("\u0019Ethereum Signed Message:\n" + msg.length + msg)
}

export const getContract = (contractAddress, abi, providerOrSigner?) => {
    return new ethers.Contract(contractAddress, abi, providerOrSigner);
}

export const rejectedByUser = (e) => {
    return e && (e.code === 4001 || e.code === 'ACTION_REJECTED')
}