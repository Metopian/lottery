import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import './CreatePage.scss'
import Datetime from 'react-datetime';
import moment from 'moment';
import "react-datetime/css/react-datetime.css";
import { getAddress, getChainId, getContract, getProvider, switchChain } from '../utils/web3Utils';
import { toast } from 'react-toastify';
const CreatePage = () => {
    // BSC TESTNET
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // const bscTestToken = "0xa2dFFea4f70d3F17f168120112627ff51C57e3F6"
    // const bscTestLuckyDraw = "0xd5b2698acAE508A30EF19B1a8D44081754Aa1923"
    const bscTestToken = "0xa2dFFea4f70d3F17f168120112627ff51C57e3F6"
    const bscTestLuckyDraw = "0xd5b2698acAE508A30EF19B1a8D44081754Aa1923"

    const create = async (data) => {
        let address = await getAddress()
        let chainId = await getChainId()
        if (parseInt(chainId) != 0x61) {
            switchChain("0x61")
            return
        }
        const provider = await getProvider()
        const contract = getContract(bscTestLuckyDraw, require('../config/LuckyDrawAbi.json').abi, provider.getSigner())
        console.log(
            data.tokenAddr,
            data.maxTickets,
            data.ticketPrice,
            data.winnerRatios,
            data.winners,
            moment(data.start).unix(),
            moment(data.end).unix())
        contract.createLottery(
            data.tokenAddr,
            data.maxTickets,
            data.ticketPrice,
            JSON.parse(data.winnerRatios),
            data.winners,
            moment(data.start).unix(),
            moment(data.end).unix()
        ).then(d => {
            console.log(d)
            toast.success('Tx send', {
                className: "r-toast",
                bodyClassName: "r-toast-body",
            })
        })
    }

    const [start, setStart] = useState(moment())
    const [end, setEnd] = useState(moment().add(600, 'second'))

    return <div className='create-page page'>
        <div className='title'><a className='back-button' onClick={() => {
            window.location.href = "/"
        }}><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></a>
            Create a Lottery</div>
        <form>
            <div className='group'>
                <label>Token address</label>
                <input {...register('tokenAddr', { required: true })} defaultValue="0xa2dFFea4f70d3F17f168120112627ff51C57e3F6" />
                {errors?.tokenAddr && <div className='error'>Required</div>}
            </div>
            <div className='group'>
                <label>Max tickets for each user</label>
                <input {...register('maxTickets', { required: true, min: 1 })} type="number" defaultValue={10} />
                {errors?.maxTickets && <div className='error'>{">0"}</div>}
            </div>
            <div className='group'>
                <label>Price for each ticket</label>
                <input {...register('ticketPrice', { required: true, min: 1 })} type="number" defaultValue={100} />
                {errors?.ticketPrice && <div className='error'>{">0"}</div>}
            </div>
            <div className='group'>
                <label>How many winners?</label>
                <input {...register('winners', { required: true, min: 1 })} type="number" defaultValue={1} />
                {errors?.winners && <div className='error'>{">0"}</div>}
            </div>
            <div className='group'>
                <label>Winner rewards proportion of the pool (ordered)</label>
                <input {...register('winnerRatios', { required: true })} placeholder={"[50,20,10]"} defaultValue="[50]" />
                {errors?.winnerRatios && <div className='error'>{"required"}</div>}
            </div>
            <div className='group date'>
                <label>Start</label>
                <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm:ss"}
                    renderInput={(props) => {
                        return <div className='time-input-wrapper'>
                            <input {...props} {...register('start', { required: true })}
                                className="r-input"
                                placeholder={"End time"}
                                onChange={e => false} />
                        </div>
                    }} value={start} onChange={d => setStart(moment(d))} />
            </div>
            <div className='group date'>
                <label>End</label>
                <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm:ss"}
                    renderInput={(props) => {
                        return <div className='time-input-wrapper'>
                            <input {...props} {...register('end', { required: true })} className="r-input" placeholder={"End time"}
                                onChange={e => false} />
                        </div>
                    }} value={end} onChange={d => setEnd(moment(d))} />
            </div>
            <button onClick={handleSubmit(create)}>Create</button>
        </form>
    </div>
}

export default CreatePage