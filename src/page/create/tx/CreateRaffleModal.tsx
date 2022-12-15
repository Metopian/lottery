import { useConnectWallet } from '@web3-onboard/react';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import MainButton from '../../../component/button/MainButton';
import { TransactionStepModal } from '../../../component/TransactionStepModal';
import { getContract, getProvider } from '../../../core/web3Utils';
import './CreateRaffleModal.scss';

// const bscTestToken = "0xd564906f62AD6c370aD1a23c51F3800624517129"
const bscTestLuckyDraw = "0xB228b6Ed35f682fCb082168dA21358a42E8D62AC"
const zeros = 1000000000000000000
export const CreateRaffleModal = (props: { hide, isShow, params }) => {
    const { hide, isShow, params: data } = props
    const [pending, setPending] = useState(false)
    const [{ wallet }] = useConnectWallet()
    const [account,] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    const luckydrawContract = useMemo(() => wallet &&
        getContract(bscTestLuckyDraw, require('../../../config/LuckyDrawAbi.json').abi,
            getProvider(wallet).getSigner()), [wallet])

    const create = () => {
        let winnerRatios = []
        for (let i = 0; i < data.winners; i++) {
            winnerRatios.push(Math.floor(100 / data.winners))
        }

        setPending(true)
        luckydrawContract.create(
            0,
            data.tokenAddr,
            1,
            data.ticketPrice * zeros+"",
            winnerRatios,
            data.winners,
            moment(data.start).unix(),
            moment(data.end).unix(),
            false
        ).then(d => {
            let syncHashes = JSON.parse(localStorage.getItem("create") || "[]")
            syncHashes.push({ account: account, hash: d.hash })
            localStorage.setItem("create", JSON.stringify(syncHashes))

            getProvider(wallet).once(d.hash, (transaction) => {
                return creationHandler(transaction, d.hash)
            })
        }).catch((e) => {
            console.log(e)
            setPending(false)
        })
    }


    const creationHandler = async (tx, hash) => {
        let syncHashes = JSON.parse(localStorage.getItem("create") || "[]")
        syncHashes = syncHashes.filter(h => h.hash !== hash)
        localStorage.setItem("create", JSON.stringify(syncHashes))

        setPending(false)
        if (tx.status === 1) {
            hide()
            window.location.href = "/app"
        } else {
            hide()
            alert("Failed")
        }
    }

    return <TransactionStepModal title={"Create a Luckydraw"} steps={[
        {
            title: "Finish the creation",
            body: <div className='synchronize-step'>

                <MainButton onClick={create} loading={pending} style={{ marginTop: '-4px' }}>Confirm</MainButton>
            </div>,
        }
    ]} introduction={<div className="creation-review-container">
        <div className='title'>Data Review</div>
        <div className='group'>
            <label>Start</label>
            <div className='val'>{moment(data.start).format("llll")}</div>
        </div>
        <div className='group'>
            <label>End</label>
            <div className='val'>{moment(data.end).format("llll")}</div>
        </div>
        <div className='group'>
            <label>Rewards supply</label>
            <div className='val'>{data.winners}</div>
        </div>
        <div className='group'>
            <label>Reward size</label>
            <div className='val'>{Math.floor(100 / data.winners)}%</div>
        </div>
        <div className='group'>
            <label>Initial pool size</label>
            <div className='val'>{data.initSize} TT</div>
        </div>
        <div className='group'>
            <label>Authentication</label>
            <div className='val'>Public</div>
        </div>
        <div className='group'>
            <label>Joining fee</label>
            <div className='val'>{data.ticketPrice} TT</div>
        </div>
    </div>}
        onHide={hide} show={isShow} stepIndex={0} />
}