import React, { useEffect, useMemo, useState } from 'react';
// import { getAddress, getChainId, getContract, getProvider, switchChain } from '../utils/web3Utils';
import './JoinPage.scss';

import { BulletList } from 'react-content-loader'
import { arabToRoman } from 'roman-numbers';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useConnectWallet } from '@web3-onboard/react';
import { getContract, getProvider, switchChain } from '../core/web3Utils';
import MainButton from '../component/button/MainButton';

const bscTestLuckyDrawAddr = "0x14169D6F660e95057fFd29452F1f056D4A3CECe9"

const toInt = (num) => parseInt(num.toString())

const LoteryCard = (props: { id, luckdrawContract }) => {
    const { id, luckdrawContract } = props
    const [data, setData] = useState(null)
    const [tickets, setTickets] = useState(1)
    const [tokenContract, setTokenContract] = useState(null)

    const [{ wallet }, connect] = useConnectWallet()
    const [account, chainId] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])


    useEffect(() => {
        if (!luckdrawContract)
            return
        const init = async () => {
            let res = await luckdrawContract.lottery(props.id)
            let [spaceId, tokenAddr, pool, maxTickets, ticketPrice, winnerRatio, vrfRequestId,
                start, end, totalTickets, claimed, requireSig] = res
            setData({
                tokenAddr, pool: toInt(pool), maxTickets: toInt(maxTickets), ticketPrice: toInt(ticketPrice),
                winnerRatio: winnerRatio.map(w => toInt(w)), winners: winnerRatio.length, vrfRequestId,
                start: moment(toInt(start) * 1000), end: moment(toInt(end) * 1000),
                totalTickets: toInt(totalTickets), claimed: toInt(claimed)
            })

            setTokenContract(getContract(tokenAddr, require('../config/ERC20Abi.json').abi, getProvider(wallet).getSigner()))
        }
        init()
    }, [id, luckdrawContract])

    const draw = async () => {

        if (!account?.length) {
            connect()
            return
        }
        if (parseInt(chainId) !== 0x61) {
            switchChain("0x61", getProvider(wallet))
            return
        }
        luckdrawContract.draw(id).then(() => {
            toast.success('Tx send', {
                className: "r-toast",
                bodyClassName: "r-toast-body",
            })
        }).catch(e => {
            console.log(e.error.message)
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

    const claim = async (amount) => {
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

    const purchase = async (amount) => {
        if (!account?.length) {
            connect()
            return
        }
        if (parseInt(chainId) !== 0x61) {
            switchChain("0x61", getProvider(wallet))
            return
        }
        // console.log(address, luckdrawContract)
        const allowance = await tokenContract.allowance(account, luckdrawContract.address);
        const val = data.ticketPrice * amount
        if (allowance < val) {
            await tokenContract.approve(luckdrawContract.address, val)
            return
        } else {
            luckdrawContract.join(id, amount).then(() => {
                toast.success('Tx send', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            }).catch(e => {
                // invalid quantity
                if (e.error.data.message.indexOf("invalid time") > -1) {
                    toast.error('Invalid time', {
                        className: "r-toast",
                        bodyClassName: "r-toast-body",
                    })
                } else if (e.error.data.message.indexOf("invalid quantity") > -1) {
                    toast.error('Invalid quantity', {
                        className: "r-toast",
                        bodyClassName: "r-toast-body",
                    })
                } else {
                    console.error(e)
                    toast.error('Failed', {
                        className: "r-toast",
                        bodyClassName: "r-toast-body",
                    })
                }
            })
        }
        // luckdrawContract.join()
    }

    return <div className='lotery-card'>
        <div className='title'>Lottery - {arabToRoman(id + 1)}</div>
        {
            data ?
                <div className='info-container'>
                    <div className='group'>
                        <label>Token contract</label>
                        <div className='val'>{data.tokenAddr}</div>
                    </div>
                    <div className='group'>
                        <label>Current pool</label>
                        <div className='val'>{data.pool}</div>
                    </div>
                    <div className='group'>
                        <label>Max tickets each person</label>
                        <div className='val'>{data.maxTickets}</div>
                    </div>
                    <div className='group'>
                        <label>Ticket price</label>
                        <div className='val'>{data.ticketPrice}</div>
                    </div>
                    <div className='group'>
                        <label>Winner proportions</label>
                        <div className='val'>{JSON.stringify(data.winnerRatio)}</div>
                    </div>
                    <div className='group'>
                        <label>Current tickets amount</label>
                        <div className='val'>{data.totalTickets}</div>
                    </div>
                    <div className='group'>
                        <label>Current token claimed by participants</label>
                        <div className='val'>{data.claimed}</div>
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
                        <div className='val'>{moment().isBefore(moment(data.start)) ? 'pending' : (
                            moment().isAfter(moment(data.end)) ? 'closed' : "alive"
                        )}</div>
                    </div>
                </div> :
                <BulletList width={'300px'} />
        }
        <div className='purchase-wrapper'>
            <label>Join</label>
            <input onChange={e => setTickets(parseInt(e.target.value))} value={tickets} type='number' />
            {/* <input onChange={e=>setTickets(parseInt())} value={tickets} /> */}
            <MainButton onClick={() => purchase(tickets)}
                disabled={moment().isBefore(moment(data?.start)) ||
                    moment().isAfter(moment(data?.end))}>Purchase</MainButton>
        </div>
        <div className='function-wrapper'>
            <MainButton onClick={claim}>Claim</MainButton>
            <MainButton onClick={draw} disabled={moment().isBefore(moment(data?.end))}>Draw</MainButton>
        </div>
    </div>
}

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
            const contract = getContract(bscTestLuckyDrawAddr, require('../config/LuckyDrawAbi.json').abi,
                getProvider(wallet).getSigner())
            setLuckyDrawContract(contract)
            let events = await contract.queryFilter(contract.filters.CreateLottery(), -4999)
            console.log(events)
            setLotIds(events.map(e => {
                return parseInt(e.args[0].toString())
            }))
        }
        setTimeout(() => {
            init()
        }, 1000);
    }, [account, chainId])

    return <div className='join-page page'>
        <div className='title'><a className='back-button' onClick={() => {
            window.location.href = "/"
        }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
            Lottery list (Luckydraws created in the recent 5000 blocks are displayed)</div>
        <div className='container'>
            {
                lotIds ? lotIds.map(id => {
                    return <LoteryCard id={id} luckdrawContract={luckyDrawContract} key={`LoteryCard-${id}`} />
                }) : <BulletList width={400} />
            }
        </div>

        <div className='footer'>
            <MainButton onClick={() => {
                window.location.href = "/create"
            }}>Create my Luckydraw</MainButton>
        </div>
    </div>
}

export default JoinPage