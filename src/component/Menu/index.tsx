import { useConnectWallet } from '@web3-onboard/react'
import React, { useMemo } from 'react'
import { getProvider, switchChain } from '../../core/web3Utils'
import './index.scss'
import HollowButton from '../button/HollowButton'
import { DefaultAvatarWithRoundBackground } from '../image/DefaultAvatar'

const LogoIcon = (props: { src: string, onClick }) => {
    return <div className={"logo-icon-wrapper"} onClick={props.onClick ||
        function () { window.location.href = "/" }}>
        <img src={props.src} alt='' />
    </div >
}

// const MenuItem = (props: { icon: string, name: string, link?: string, isIcon?: boolean, onClick?: OnClickFuncType, fill?: boolean }) => {
//     const { icon, name, link, isIcon, fill } = props
//     return <div className={"menu-item" + (isIcon ? ' isIcon' : '') + (fill ? ' fill' : '')} onClick={(e) => {
//         if (props.onClick)
//             props.onClick(e)
//         else if (link) window.location.href = link
//     }}>
//         {
//             <img src={icon} title={name} alt={name} />
//         }
//     </div >
// }
const MenuItem = (props: { name: string, link: string, active?: any }) => {
    const { name, link, active } = props
    return <a className={"menu-item" + (active ? ' active' : '')} href={link} >{name}</a >
}

const menuItems = [
    {
        name: 'Home',
        link: '/',
    }, {
        name: 'App',
        link: "/app"
    }
]

const NetworkSelector = () => {
    const [{ wallet }] = useConnectWallet()
    const [, chainId] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    const onChange = (chain) => {
        switchChain('0x' + parseInt(chain).toString(16), getProvider(wallet))
    }

    const chainInfo = useMemo(() => {
        if (parseInt(chainId) === 97) {
            return <>
                <img src="https://oss.metopia.xyz/imgs/bsc.svg" alt="" />
                <div className="text">BNB Testnet</div>
            </>
        }


        else {
            return <><img src="https://oss.metopia.xyz/imgs/error-fill.svg" alt="" /><div className="text">Wrong network</div></>
        }
    }, [chainId])

    return <div className='network-selector'>
        <div className='value'>
            {chainInfo} <img src="https://oss.metopia.xyz/imgs/chevron.svg" alt="" style={{ height: '16px', marginRight: 0 }} />
        </div>
        <div className='drop-down'>
            <div className='text'>Select a network</div>
            {/* <div className="option" onClick={() => onChange(1)}>
                <img src="https://oss.metopia.xyz/imgs/ethereum.png" style={{ backgroundColor: '#A195FF' }} alt="" />
                <div className="text">Ethereum</div>
            </div>
            <div className="option" onClick={() => onChange(0x89)}>
                <div className='img-wrapper'>
                    <img src="https://oss.metopia.xyz/imgs/polygon.svg" alt="" />
                </div>
                <div className="text">Polygon</div>
            </div> */}
            <div className="option" onClick={() => onChange(97)}>
                <img src="https://oss.metopia.xyz/imgs/bsc.svg" alt="" />
                <div className="text">BNB Testnet</div>
            </div>
        </div>
    </div>
}

const Menu = (props) => {
    const { active } = props
    const [{ wallet }, connect, disconnect] = useConnectWallet()

    const [account, ] =
        useMemo(() => wallet?.accounts?.length ? [wallet.accounts[0].address, wallet.chains[0].id] : [], [wallet])

    return <div className="menu-bar">
        <div className='container'>
            <div onClick={() => { window.location.href = "/" }} className="logowrapper">
                <img src={"https://oss.metopia.xyz/imgs/metopia-logo.svg"} alt='' />
            </div >
            <div className="menu-item-container" >
                {
                    menuItems && menuItems.map((i, j) => {
                        return <MenuItem {...i} key={'menuitem' + i.name} active={active === j + 1} />
                    })
                }
            </div>
            <div className='account-info-container'>
                {
                    !account ? <HollowButton onClick={() => {
                        connect()
                    }}>Connect wallet</HollowButton> :
                        (<>
                            <NetworkSelector />
                            <div className='avatar-wrapper'>
                                <DefaultAvatarWithRoundBackground height={32}
                                    account={account} />
                                <div className='drop-down'>
                                    <div className="option" onClick={(e) => {
                                        disconnect(wallet)
                                        localStorage.setItem("disconnect", 'true')
                                        e.stopPropagation()
                                    }}>
                                        <img src="https://oss.metopia.xyz/imgs/exit.svg" alt=""/>
                                        <div className='text'>Disconnect</div></div>
                                </div>
                            </div>
                        </>)
                }
            </div>
        </div>
    </div >
}


export { Menu, MenuItem, LogoIcon }

