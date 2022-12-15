import React, { useEffect, useMemo, useState } from 'react';
// import { getAddress, getChainId, getContract, getProvider, switchChain } from '../utils/web3Utils';
import './index.scss';

import { useConnectWallet } from '@web3-onboard/react';
import { BulletList } from 'react-content-loader';
import MainButton from '../../component/button/MainButton';
import { getContract, getProvider, switchChain } from '../../core/web3Utils';
import LotteryCard from './component/LotteryCard';
import { JoinRaffleModal } from './tx/JoinRaffleModal';

const bscTestLuckyDrawAddr = "0xB228b6Ed35f682fCb082168dA21358a42E8D62AC"

const JoinPage = () => {
    // BSC TESTNET

    const [luckyDrawContract, setLuckyDrawContract] = useState(null)

    const [{ wallet }, connect] = useConnectWallet()
    const [account, chainId] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    const [lotIds, setLotIds] = useState(null)


    useEffect(() => {
        const init = async () => {
            if (!account?.length) {
                connect()
                return
            }
            if (parseInt(chainId) !== 0x61) {
                alert("You are required to switch to BSC Testnet")
                switchChain("0x61", getProvider(wallet))
                return
            }
            const contract = getContract(bscTestLuckyDrawAddr, require('../../config/LuckyDrawAbi.json').abi,
                getProvider(wallet).getSigner())
            setLuckyDrawContract(contract)
            let events = await contract.queryFilter(contract.filters.CreateLottery(), -4999)
            setLotIds(events.map(e => {
                return parseInt(e.args[0].toString())
            }))
        }
        setTimeout(() => {
            init()
        }, 1000);
    }, [account, chainId, connect, wallet])

    const [selectedId, setSelectedId] = useState(null)
    const [selectedData, setSelectedData] = useState(null)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const joinRaffle = (id, data) => {
        if (!account?.length) {
            connect()
            return
        }
        if (parseInt(chainId) !== 0x61) {
            alert("You are required to switch to BSC Testnet")
            switchChain("0x61", getProvider(wallet))
            return
        }
        setSelectedId(id)
        setSelectedData(data)
        setShowJoinModal(true)
    }

    return <div className='join-page page'>
        <div className='title'><a className='back-button' href="/"  >
            <img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
            Lottery list <div className='description'>Luckydraws created in the recent 5000 blocks are displayed</div></div>
        <div className='container'>
            {
                lotIds ? lotIds.sort((l1, l2) => l1 < l2 ? 1 : -1).map(id => {
                    return <LotteryCard id={id}
                        luckdrawContract={luckyDrawContract}
                        key={`LoteryCard-${id}`} joinRaffle={joinRaffle} />
                }) : <BulletList width={400} />
            }
        </div>
        <div className='footer'>
            <MainButton onClick={() => {
                window.location.href = "/create"
            }}>Create my Luckydraw</MainButton>
        </div>

        <JoinRaffleModal data={selectedData} hide={() => setShowJoinModal(false)} isShow={showJoinModal} id={selectedId} />
    </div>
}

export default JoinPage