import React from 'react'
import CreatePage from './CreatePage'
import JoinPage from './JoinPage'
import './index.scss';

const IndexPage = () => {
    // BSC TESTNET
    const contract = "0xd5b2698acAE508A30EF19B1a8D44081754Aa1923"

    return <div className='index page'>
        <div className='title'>Metopia Lottery Demo</div>
        <ul>
            <li><a href="/create">Create</a></li>
            <li><a href="/join">Join</a></li>
        </ul>
    </div>
}

export default IndexPage
export { CreatePage, JoinPage }