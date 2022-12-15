import { useConnectWallet } from '@web3-onboard/react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import MainButton from '../../../component/button/MainButton';
import { TransactionStepModal } from '../../../component/TransactionStepModal';
import { getContract, getProvider } from '../../../core/web3Utils';
import './JoinRaffleModal.scss';

const bscTestToken = "0xd564906f62AD6c370aD1a23c51F3800624517129"
const bscTestLuckyDrawContract = "0xB228b6Ed35f682fCb082168dA21358a42E8D62AC"
const zeros = 1000000000000000000

export const JoinRaffleModal = (props: { hide, isShow, data, id }) => {
    const { hide, isShow, data, id } = props
    const [pending, setPending] = useState(false)
    const [{ wallet }] = useConnectWallet()
    const [account,] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    const luckydrawContract = useMemo(() => wallet &&
        getContract(bscTestLuckyDrawContract, require('../../../config/LuckyDrawAbi.json').abi,
            getProvider(wallet).getSigner()), [wallet])
    const tokenContract = useMemo(() => wallet &&
        getContract(bscTestToken, require('../../../config/ERC20Abi.json').abi,
            getProvider(wallet).getSigner()), [wallet])

    const [approved, setApproved] = useState(false)

    useEffect(() => {
        if (!wallet || !data)
            return
        const init = async () => {
            const allowance = await tokenContract.allowance(account, bscTestLuckyDrawContract);
            if (parseInt(allowance.toString()) >= data.ticketPrice) {
                setApproved(true)
            }
        }
        init()
    }, [wallet, account, data,tokenContract])

    const approve = () => {
        setPending(true)
        tokenContract.approve(bscTestLuckyDrawContract,
            (data.ticketPrice).toString()).then((d) => {
                let syncHashes = JSON.parse(localStorage.getItem("approve") || "[]")
                syncHashes.push({ hash: d.hash })
                localStorage.setItem("approve", JSON.stringify(syncHashes))

                getProvider(wallet).once(d.hash, (transaction) => {
                    return approveHandler(transaction, d.hash)
                })
            }).catch((e) => {
                console.log(e)
                setPending(false)
            })
    }

    const approveHandler = async (tx, hash) => {
        let syncHashes = JSON.parse(localStorage.getItem("approve") || "[]")
        syncHashes = syncHashes.filter(h => h.hash !== hash)
        localStorage.setItem("approve", JSON.stringify(syncHashes))

        setPending(false)
        if (tx.status === 1) {
            setApproved(true)
        } else {
            hide()
            alert("Failed")
        }
    }

    const join = () => {
        setPending(true)
        luckydrawContract.join(id, 1, "0x").then((d) => {
            let syncHashes = JSON.parse(localStorage.getItem("join") || "[]")
            syncHashes.push({ hash: d.hash })
            localStorage.setItem("join", JSON.stringify(syncHashes))

            getProvider(wallet).once(d.hash, (transaction) => {
                return joinHandler(transaction, d.hash)
            })
        }).catch(e => {
            console.log(e)
            setPending(false)
            if (e.error.data.message.indexOf("invalid time") > -1) {
                hide()
                toast.error('Invalid time', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            } else if (e.error.data.message.indexOf("invalid quantity") > -1) {
                hide()
                toast.error('Invalid quantity', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            } else {
                hide()
                toast.error('Failed', {
                    className: "r-toast",
                    bodyClassName: "r-toast-body",
                })
            }
        })
    }
    const joinHandler = async (tx, hash) => {
        let syncHashes = JSON.parse(localStorage.getItem("join") || "[]")
        syncHashes = syncHashes.filter(h => h.hash !== hash)
        localStorage.setItem("join", JSON.stringify(syncHashes))

        setPending(false)
        if (tx.status === 1) {
            hide()
            toast.success('Tx send', {
                className: "r-toast",
                bodyClassName: "r-toast-body",
            })

            setTimeout(() => {
                window.location.reload()
            }, 1000);
        } else {
            hide()
            alert("Failed")
        }
    }


    return <TransactionStepModal title={"Join a Luckydraw"} steps={[
        {
            title: "Approve the fee",
            body: <div className='synchronize-step'>
                <MainButton onClick={approve} loading={pending} style={{ marginTop: '-4px' }}>Approve</MainButton>
            </div>,
        }, {
            title: "Join the raffle",
            body: <div className='synchronize-step'>
                <MainButton onClick={join} loading={pending} style={{ marginTop: '-4px' }}>Confirm</MainButton>
            </div>,
        },
    ]} introduction={<div className="join-review-container">
        <div>Participation cost: {data?.ticketPrice / zeros} TT</div>
    </div>}
        onHide={hide} show={isShow} stepIndex={approved ? 1 : 0} />
}