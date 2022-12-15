import moment from 'moment'
import React from 'react'
import Datetime from 'react-datetime'
import { FormGroup, Input, Label } from '../../../component/form'
import './BasicSettingsPage.scss'

const BasicSettingsPage = (props: { onChange, data }) => {
    const { onChange, data } = props

    return <div className='basic-settings-subpage'>
        <div className='form'>
            <FormGroup>
                <Label>Start time</Label>
                <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                    return <div className='time-input-wrapper'>
                        <input {...props} className="r-input" placeholder={"Start time"}
                            onChange={e => false} />
                        <img src="https://oss.metopia.xyz/imgs/calendar.svg" alt="" className='calendar-icon' />
                    </div>
                }} isValidDate={(currentDate, selectedDate) => {
                    return !currentDate?.isBefore(moment().format('YYYY-MM-DD'))
                }} onChange={d => {
                    onChange({ start: moment(d) })
                }} value={data.start} />
            </FormGroup>
            <FormGroup>
                <Label>End time</Label>
                <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                    return <div className='time-input-wrapper'>
                        <input {...props} className="r-input" placeholder={"Start time"}
                            onChange={e => false} />
                        <img src="https://oss.metopia.xyz/imgs/calendar.svg" alt="" className='calendar-icon' />
                    </div>
                }} isValidDate={(currentDate, selectedDate) => {
                    return !currentDate?.isBefore(data.start)
                }} onChange={d => {
                    onChange({ end: moment(d) })
                }} value={data.end} />
            </FormGroup>
            <FormGroup >
                <Label>Reward supply</Label>
                <div className='tip'>How many participants could win the rewards</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Input type="number" className="short"
                        value={data.winners}
                        onChange={(e) => {
                            onChange({ winners: e.target.value })
                        }} />
                    <div></div>
                </div>
            </FormGroup>
            <FormGroup >
                <Label>Ticket price</Label>
                <div className='tip' >What's the fee to join the raffle</div>
                <div className='tip' style={{ marginTop: '-8px' }}>Test token: <a href={"https://testnet.bscscan.com/address/0xd564906f62AD6c370aD1a23c51F3800624517129"}>0xd564906f62AD6c370aD1a23c51F3800624517129</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Input type="number" className="short"
                        value={data.ticketPrice}
                        onChange={(e) => {
                            onChange({ ticketPrice: e.target.value })
                        }} />
                    <div>* 10^18 (decimals)</div>
                </div>
            </FormGroup>
            <FormGroup >
                <Label>Initial pool size</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Input type="number" className="short"
                        value={data.initSize}
                        onChange={(e) => {
                            onChange({ initSize: e.target.value })
                        }} />
                    <div>* 10^18 (decimals)</div>
                </div>
            </FormGroup>

        </div>
    </div >
}

export default BasicSettingsPage