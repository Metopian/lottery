import { useConnectWallet } from '@web3-onboard/react'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import "react-datetime/css/react-datetime.css"
import MainButton from '../../component/button/MainButton'
import StepLinearIndicator from '../../component/StepLinearIndicator'
import { getProvider, switchChain } from '../../core/web3Utils'
import { useScrollTop } from '../../utils/useScollTop'
import './index.scss'
import BasicSettingsPage from './subpage/BasicSettingsPage'
import EntriesPage from './subpage/EntriesPage'
import { CreateRaffleModal } from './tx/CreateRaffleModal'

const bscTestToken = "0xd564906f62AD6c370aD1a23c51F3800624517129"
// const bscTestLuckyDraw = "0xB228b6Ed35f682fCb082168dA21358a42E8D62AC"

const CreateRafflePage = () => {
    const [scrollTop] = useScrollTop()
    const [page, setPage] = useState(1)

    const [{ wallet }, connect] = useConnectWallet()
    const [account, chainId] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    /**
     * Init val
     */
    const [data, setData] = useState({
        public: 1,
        chain: '0x61',
        creator: account,
        title: "My event",
        body: "My introduction",
        cover: null,
        tokenAddr: bscTestToken,
        maxTickets: 1,
        ticketPrice: 1,
        winners: 1,
        start: moment(),
        end: moment().add(3600 * 24 * 7),
        initSize: 0
    })

    const smartSetData = useCallback((params: Object) => {
        setData(Object.assign({}, data, params))
    }, [data])

    useEffect(() => {
        if (page > 1) {
            setTimeout(() => {
                document.getElementById("createRaffleBodyContainer").style.transition = '0ms'
            }, 300);
        }
        return () => {
            document.getElementById("createRaffleBodyContainer").style.transition = '300ms'
        }
    }, [page])

    const [showTxModal, setShowTxModal] = useState(false)

    return <div className='page'>
        <div className='container'>
            <div className='create-raffle-page'>
                <div className="head" style={{ opacity: scrollTop > 89 ? Math.max(289 - scrollTop, 0) * 0.005 : 1 }}>
                    <a className='back-button' href="/join"  ><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
                    <div className='title'>Create a Luckydraw</div>
                    <StepLinearIndicator steps={[
                        { text: 'Basic information', state: page },
                        { text: 'Entries', state: page - 1 },
                    ]} style={{ marginTop: '65px' }} />
                </div>

                <div className={'head-fixed' + (scrollTop < 189 ? " invisible" : '')} style={{
                    opacity: 1 - (scrollTop > 189 ? Math.max(389 - scrollTop, 0) * 0.005 : 1),
                    position: scrollTop > 189 ? 'fixed' : 'unset',
                    zIndex: '4',
                }}>
                    <div className='container'>
                        <div className='back-button' onClick={() => {
                            window.location.href = "/app"
                        }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></div>
                        <div className='title'>Create a Luckydraw</div>
                        <StepLinearIndicator steps={[
                            { text: 'Basic information', state: page },
                            { text: 'Entries', state: page - 1 },
                        ]} style={{ marginTop: '65px' }} />
                    </div>
                </div>

                <div className={`body page${page}`}>
                    <div className='container' style={{ height: page === 0 ? 'auto' : 'fit-content' }} id="createRaffleBodyContainer">
                        <div className='subpage-wrapper'>
                            <BasicSettingsPage onChange={smartSetData} data={data} />
                        </div>
                        <div className='subpage-wrapper'>
                            <EntriesPage onChange={smartSetData} data={data} />
                        </div>
                    </div>
                </div>


                <div className='footer'>
                    <MainButton onClick={() => {
                        document.getElementById("createRaffleBodyContainer").style.transition = '300ms'
                        setPage(page - 1)
                    }} style={page === 1 ? { display: 'none' } : null}> <img src="https://oss.metopia.xyz/imgs/arrow-left.svg" style={{ height: '20px' }} alt="" />&nbsp;Previous</MainButton>
                    <MainButton onClick={() => { setPage(page + 1) }
                    } style={page === 2 ? { display: 'none' } : null}>Next &nbsp;<img src="https://oss.metopia.xyz/imgs/arrow-left.svg" style={{ transform: 'rotate(180deg)', height: '20px' }} alt="" /></MainButton>
                    <MainButton onClick={() => {
                        if (!data.title || data.title.length < 1) {
                            setPage(1)
                            alert('Please provide the name of the event')
                            return
                        }
                        if (data.body?.length < 0) {
                            alert('Please provide the introduction of the event')
                            setPage(1)
                            return
                        }


                        if (!account?.length) {
                            connect()
                            return
                        }
                        if (parseInt(chainId) !== 0x61) {
                            switchChain("0x61", getProvider(wallet))
                            return
                        }

                        // create()
                        setShowTxModal(true)
                    }} style={page !== 2 ? { display: 'none' } : null}
                    >Confirm</MainButton>
                </div>
            </div>
        </div>
        <CreateRaffleModal isShow={showTxModal} hide={() => setShowTxModal(false)} params={data} />
    </div>
}

export default CreateRafflePage 