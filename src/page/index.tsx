import React, { useMemo } from 'react';
import HollowButton from '../component/button/HollowButton';
import './Index.scss';

const partners = [
    {
        logo: "https://oss.metopia.xyz/imgs/R8-logo-gray.png",
        link: "http://www.r8.capital",
        height: 32,
    }, {
        logo: "https://oss.metopia.xyz/imgs/kik-logo2.png",
        link: "https://www.kikitrade.com/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/chainide-logo-gray.png",
        link: "https://chainide.com/",
        height: 46,
    }, {
        logo: "https://oss.metopia.xyz/imgs/matrix-logo-gray.png",
        link: "https://matrixworld.org/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/metadojo-logo-gray.png",
        link: "https://www.metadojo.io/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/vendatta-logo-gray.png",
        link: "https://vendettadao.com/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/lululand-logo.png",
        link: "https://www.lululand.world/",
        height: 26,
    }, {
        logo: "https://oss.metopia.xyz/imgs/kokonut-logo.png",
        link: "https://kokonut.network/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/landbox-logo.png",
        link: "https://home.oland.info/home/"
    }, {
        logo: "https://oss.metopia.xyz/imgs/metopia-logo-grey.png",
        height: 28,
    },
]

const IndexPage = () => {
    // BSC TESTNET

    const partnerEles = useMemo(() => {
        return partners.map((s, i) => {
            return <React.Fragment key={`sponsor-${i}`}>
                <img src={s.logo} onClick={e => {
                    s.link && window.open(s.link)
                }} style={s.height ? { height: s.height + 'px' } : null} alt="" />
            </React.Fragment>
        })
    }, [])

    return <div className='index page'>
        <img src="/imgs/bg.png" className='bg' alt="" />
        <img src="/imgs/metopia.png" className='bg2' draggable={false} alt="" />

        <div className='container'>
            <div className='head'>
                <div className='text'>
                    <div className='title'>Metopian Luckydraw</div>
                    <div className='subtitle'>The Web3 tool to create a secured & justified random raffle.</div>
                </div>
                <div className='icon-group'>
                    <div className='container'>
                        Join:
                        <img src="https://oss.metopia.xyz/imgs/twitter-hollow.svg" onClick={() => {
                            window.open("https://twitter.com/MetopiaMetopian")
                        }} alt="TWITTER" style={{ transform: 'translateY(1px)' }} />
                        <img src="https://oss.metopia.xyz/imgs/discord.svg" onClick={e => {
                            window.open("https://discord.com/invite/yTseCeHNEk")
                        }} alt="DISCORD" style={{ height: '28px', width: '28px', transform: 'translateY(-1px)' }} />
                    </div>
                </div>
            </div>
            <div className='body'>
                <section>
                    <img src="/imgs/metopian1.png" alt="" className='featured-image' />
                    <div className='text'>
                        <div className='title'>Mechanism</div>
                        <div className='content'>
                            Metopian Luckydraw works for the organizations who are going to provide incentives to their community through Web3 methods.
                            The system is able to draw a random list of winners from the participants.
                        </div>
                    </div>
                </section>
                <section>
                    <div className='text'>
                        <div className='title'>Secured</div>
                        <div className='content'>
                            Most communities even the crypto ones run their luckydraw events without a secured & public process.
                            We are providing the solution that utilizes the <a href="https://vrf.chain.link/">Verifiable Randomness Function</a> provided by Chainlink on EVM chains.
                        </div>
                    </div>
                    <img src="/imgs/metopian2.png" alt="" className='featured-image' />
                </section>

                <section>
                    <img src="/imgs/metopian3.png" alt="" className='featured-image' />
                    <div className='text'>
                        <div className='title'>Customizable</div>
                        <div className='content'>
                            Generally Luckydraw creators are able to enable the signature verification, to allow restricted participants to join the Luckydraw.
                            Further for NFT communities, we provide the on-chain solution to verify the participants balance.
                        </div>
                        <HollowButton onClick={e => window.location.href = "/create"}>Start the journey</HollowButton>
                    </div>
                </section>
            </div>
        </div>

        <div className='footer'>
            <div className='container'>
                {partnerEles}
                <div className='background'>
                    Partnered with
                </div>
            </div>
        </div>
    </div>
}

export default IndexPage