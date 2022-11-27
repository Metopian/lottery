
import { ethers, utils } from "ethers";
import { currencyMap, chainMap, chainExplorerMap, chainRpcMap } from "../config/constant";

let provider = null
export const getProvider = () => {
    if (!provider) {
        if ((window as any).ethereum) {
            provider = new ethers.providers.Web3Provider((window as any).ethereum, 'any');
        } else {
            // window.alert("Please install web3 wallet")
            throw new Error("Please install web3 wallet");
        }
    }
    return provider
}
// ethereum.isMetaMask

export const getAddress = async () => {
    try {
        let addresses = await getProvider().listAccounts();
        if (addresses.length > 0)
            return addresses[0]
        addresses = await getProvider().send("eth_requestAccounts", []);
        let address = utils.getAddress(addresses[0])
        return address
    } catch (e) {
        if (e == -32002)
            return ""
        else
            return null
    }
}

export const getChainId = async () => {
    return await getProvider().send("eth_chainId", [])
}

export const hashWithPrefix = (msg) => {
    return utils.keccak256("\u0019Ethereum Signed Message:\n" + msg.length + msg)
}

export const sign = async (msg) => {
    return await getProvider().getSigner().signMessage(msg)
}

export const addChain = (chain) => {
    let chainId = '0x' + parseInt(chain).toString(16)
    return getProvider().send("wallet_addEthereumChain", [
        {
            chainId: chainId,
            rpcUrls: [chainRpcMap[chainId]],
            chainName: chainMap[chainId],
            nativeCurrency: {
                name: currencyMap[chainId],
                symbol: currencyMap[chainId],
                decimals: 18
            },
            blockExplorerUrls: [chainExplorerMap[chainId]]
        }]
    )
}

export const switchChain = (chain: string) => {
    let chainId = '0x' + (parseInt(chain) || 1).toString(16)
    return getProvider().send("wallet_switchEthereumChain", [
        { chainId: chainId }]
    ).catch(e => {
        if (e.code == 4902) {
            addChain(chainId)
        }
    })
}


export const signTypedData = async (message, types, domain) => {
    // @ts-ignore
    let address = await getAddress()
    const signer = getProvider().getSigner();
    if (!message.from) message.from = address;
    if (!message.timestamp)
        message.timestamp = parseInt((Date.now() / 1e3).toFixed());
    const data: any = { domain, types, message };
    const sig = await signer._signTypedData(domain, data.types, message);
    return { address, sig, data }
}

export const getEns = async (address): Promise<string> => {
    if (!address?.length)
        return ''
    const ens = localStorage.getItem(address);
    if (ens?.length)
        return ens;

    return await getProvider().lookupAddress(address).then(e => {
        if (e)
            localStorage.setItem(address, e);
        return e
    }).catch(e => {
        console.error(e)
        return ''
    })
}

export const fromEns = async (ens): Promise<string> => {
    if (!ens.length)
        return ''
    const address = localStorage.getItem(ens);
    if (address?.length)
        return address;

    await getProvider().getResolver(ens).then(e => {
        return e.getAddress()
    }).then(address => {
        if (!address?.length)
            return ''
        localStorage.setItem(ens, address);
        return address
    }).catch(e => {
        console.error(e)
        return ''
    })
}

export const getContract = (contractAddress, abi, providerOrSigner?) => {
    return new ethers.Contract(contractAddress, abi, providerOrSigner || getProvider());
}

export const rejectedByUser = (e) => {
    return e && (e.code == 4001 || e.code == 'ACTION_REJECTED')
}