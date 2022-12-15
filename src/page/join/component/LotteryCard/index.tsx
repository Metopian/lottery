import React, { useEffect, useMemo, useState } from 'react';
import './index.scss';

import { useConnectWallet } from '@web3-onboard/react';
import moment from 'moment';
import { BulletList } from 'react-content-loader';
import { toast } from 'react-toastify';
import { arabToRoman } from 'roman-numbers';
import MainButton from '../../../../component/button/MainButton';
import { getProvider, switchChain } from '../../../../core/web3Utils';

// const bscTestLuckyDrawAddr = "0xB228b6Ed35f682fCb082168dA21358a42E8D62AC"

const zeros = 1000000000000000000
const toInt = (num) => parseInt(num.toString())

const LotteryCard = (props: { id, luckdrawContract, joinRaffle }) => {
    const { id, luckdrawContract, joinRaffle } = props
    const [data, setData] = useState(null)

    const [{ wallet }, connect] = useConnectWallet()
    const [account, chainId] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])
    const [claimable, setClaimable] = useState(0)

    const [myTickets, setMyTickets] = useState(null)
    const [vrfFilled, setVrfFilled] = useState(null)

    useEffect(() => {
        if (!luckdrawContract || !wallet)
            return
        const init = async () => {
            let res = await luckdrawContract.lottery(id)
            let [, tokenAddr, pool, maxTickets, ticketPrice, winnerRatio, vrfRequestId,
                start, end, totalTickets, claimed,] = res
            setData({
                tokenAddr, pool: toInt(pool), maxTickets: toInt(maxTickets), ticketPrice: toInt(ticketPrice),
                winnerRatio: winnerRatio.map(w => toInt(w)), winners: winnerRatio.length, vrfRequestId,
                start: moment(toInt(start) * 1000), end: moment(toInt(end) * 1000),
                totalTickets: toInt(totalTickets), claimed: toInt(claimed)
            })
            let tickets = await luckdrawContract.ticketsByUser(id, account)
            setMyTickets(tickets)

            if (vrfRequestId > 0) {
                let [vrfStatus] = await luckdrawContract.getRequestStatus(vrfRequestId)
                setVrfFilled(vrfStatus)


                let prize = await luckdrawContract.prize(id)
                setClaimable(prize)
            }
        }
        init()
    }, [id, account, luckdrawContract, wallet])

    const [drawingWinner, setDrawingWinner] = useState(false)
    const draw = async () => {
        if (!account?.length) {
            connect()
            return
        }
        if (parseInt(chainId) !== 0x61) {
            switchChain("0x61", getProvider(wallet))
            return
        }

        setDrawingWinner(true)
        luckdrawContract.draw(id).then((d) => {
            toast.success('Start processing', {
                className: "r-toast",
                bodyClassName: "r-toast-body",
            })
            let syncHashes = JSON.parse(localStorage.getItem("draw") || "[]")
            syncHashes.push({ hash: d.hash })
            localStorage.setItem("draw", JSON.stringify(syncHashes))

            getProvider(wallet).once(d.hash, (transaction) => {
                return drawWinnerHandler(transaction, d.hash)
            })
        }).catch(e => {
            console.log(e.error.message)
            setDrawingWinner(true)
            if (e.error.data.message.indexOf("no result") > -1) {
                toast.error('Lottery winners are not revealed', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            } else {
                console.error(e)
                if (e.error.data.message.indexOf("not available") > -1) {
                    toast.error('Please wait till the lottery finished', {
                        className: "r-toast",
                        bodyClassName: "r-toast-body",
                    })
                } else {
                    toast.error('failed', {
                        className: "r-toast",
                        bodyClassName: "r-toast-body",
                    })
                }
            }
        })
    }

    const drawWinnerHandler = async (tx, hash) => {
        let syncHashes = JSON.parse(localStorage.getItem("draw") || "[]")
        syncHashes = syncHashes.filter(h => h.hash !== hash)
        localStorage.setItem("draw", JSON.stringify(syncHashes))

        setDrawingWinner(true)
        if (tx.status === 1) {

            let res = await luckdrawContract.lottery(id)
            let [, tokenAddr, pool, maxTickets, ticketPrice, winnerRatio, vrfRequestId,
                start, end, totalTickets, claimed,] = res
            setData({
                tokenAddr, pool: toInt(pool), maxTickets: toInt(maxTickets), ticketPrice: toInt(ticketPrice),
                winnerRatio: winnerRatio.map(w => toInt(w)), winners: winnerRatio.length, vrfRequestId,
                start: moment(toInt(start) * 1000), end: moment(toInt(end) * 1000),
                totalTickets: toInt(totalTickets), claimed: toInt(claimed)
            })

            const tmp = setInterval(async () => {
                if (vrfRequestId > 0) {
                    let [vrfStatus] = await luckdrawContract.getRequestStatus(vrfRequestId)
                    if (vrfStatus) {
                        setDrawingWinner(false)

                        setVrfFilled(vrfStatus)

                        let prize = await luckdrawContract.prize(id)
                        setClaimable(prize)
                        clearInterval(tmp)
                    }
                }
            }, 2000)


        } else {
            alert("Failed")
        }
    }

    const claim = async () => {
        if (!account?.length) {
            connect()
            return
        }
        if (parseInt(chainId) !== 0x61) {
            switchChain("0x61", getProvider(wallet))
            return
        }
        luckdrawContract.claim(id).then(() => {
            toast.success('Tx send', {
                className: "r-toast",
                bodyClassName: "r-toast-body",
            })
        }).catch(e => {
            if (e.error.data.message.indexOf("no result") > -1) {
                toast.error('Lottery winners are not revealed', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            } else {
                console.error(e)
                toast.error('failed', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            }
        })
    }

    const status = useMemo(() => {
        if (!data)
            return ""
        return moment().isBefore(moment(data.start)) ? 'Pending' : (
            moment().isAfter(moment(data.end)) ? (
                data.vrfRequestId > 0 ? (vrfFilled ? "Finished" : "Closed (Randomness processing)") : "Closed (pending)"
            ) : "alive"
        )
    }, [data, vrfFilled])


    return <div className='lotery-card'>
        <div className='title'>Lottery - {arabToRoman(id + 1)}</div>
        {
            data ?
                <div className='info-container'>
                    <div className='group'>
                        <label>Token</label>
                        <div className='val'>
                            {"Test Token (TT)"}<a href="https://testnet.bscscan.com/address/0xd564906f62AD6c370aD1a23c51F3800624517129#writeContract">Faucet</a>
                        </div>
                    </div>
                    <div className='group'>
                        <label>Current pool</label>
                        <div className='val'>{data.pool / zeros} TT</div>
                    </div>
                    <div className='group'>
                        <label>Joining fee</label>
                        <div className='val'>{data.ticketPrice / zeros} TT</div>
                    </div>
                    <div className='group'>
                        <label>Reward size</label>
                        <div className='val'>{(data.winnerRatio[0])}%</div>
                    </div>
                    <div className='group'>
                        <label>Total participants</label>
                        <div className='val'>{data.totalTickets}</div>
                    </div>
                    <div className='group'>
                        <label>Total claimed token</label>
                        <div className='val'>{data.claimed / zeros} TT</div>
                    </div>
                    <div className='group'>
                        <label>Start</label>
                        <div className='val'>{moment(data.start).format("llll")}</div>
                    </div>
                    <div className='group'>
                        <label>End</label>
                        <div className='val'>{moment(data.end).format("llll")}</div>
                    </div>
                    <div className='group'>
                        <label>Status</label>
                        <div className='val'>{status}</div>
                    </div>
                    <div className='group'>
                        <label>My reward</label>
                        <div className='val'>{claimable ? claimable / zeros + " TT" : '0'}</div>
                    </div>
                </div> :
                <BulletList width={'300px'} />
        }
        <div className='function-wrapper'>
            <MainButton onClick={() => joinRaffle(id, data)}
                disabled={moment().isBefore(moment(data?.start)) ||
                    moment().isAfter(moment(data?.end)) || myTickets?.length > 0}
                loading={myTickets == null}>Join</MainButton>
            <MainButton onClick={claim} disabled={claimable <= 0}>Claim</MainButton>
            <MainButton onClick={draw} disabled={moment().isBefore(moment(data?.end)) ||
                parseInt(data?.vrfRequestId) > 0} loading={drawingWinner}>Draw winners</MainButton>
        </div>
    </div>
}

export default LotteryCard