import moment from 'moment'
import React from 'react'
import Datetime from 'react-datetime'
import { FormGroup, Input, Label, Textarea } from '../../../component/form'
import './BasicSettingsPage.scss'

const BasicSettingsPage = (props: { onChange, data }) => {
    const { onChange, data } = props

    return <div className='basic-settings-subpage'>
        <div className='form'>
            <FormGroup>
                <Label required="true">Event title</Label>
                <Input
                    value={data.title}
                    onChange={e => onChange({ title: e.target.value.trim() })} />
            </FormGroup>
            <FormGroup>
                <Label required="true">Event Introduction</Label>
                <Textarea value={data.body} onChange={(e) => {
                    onChange({ body: e.target.value })
                }} />
            </FormGroup>
            <FormGroup>
                <Label required="true">Start time</Label>
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
                <Label required="true">End time</Label>
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
                <Label>Set ticket price</Label>
                <div className='tip'>Test token: <a href={"https://testnet.bscscan.com/address/0x24a3c07df3fc5d4535c9bcfe82aae8ffdc85b3f9"}>0x24A3c07df3fC5D4535C9BCfe82aAE8FFdc85B3f9</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Input type="number" className="short"
                        minValue={1}
                        value={data.ticketPrice}
                        onChange={(e) => {
                            // console.log(val)
                            onChange({ ticketPrice: e.target.value })
                        }} />
                    <div>* 10^18</div>
                </div>
            </FormGroup>

        </div>
    </div >
}

export default BasicSettingsPage