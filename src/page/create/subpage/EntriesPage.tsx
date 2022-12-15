import React from 'react';
import { SettingsSingleChoice } from '../../../component/SettingsOption';
import './EntriesPage.scss';

const EntriesPage = (props: { onChange, data }) => {
    return <div className='entries-subpage'>
        <div className='head'>Choose the participants type</div>
        <SettingsSingleChoice title={'Public'}
            subtitle={'The event is open to all users'}
            onActive={() => {
                // onChange({ public: 1 })
            }} onDeactive={() => {
                // onChange({ public: -1 })
            }}
            defaultHeight={0} checked={true}
            style={false ? { filter: 'brightness(50%)' } : null}>
            <></>
        </SettingsSingleChoice>
        <SettingsSingleChoice title={'Private (coming soon)'}
            subtitle={'Specified NFT holders or discord roles'}
            onActive={() => {
                // onChange({ public: 0 })
            }} onDeactive={() => {
                // onChange({ public: -1 })
            }}
            defaultHeight={0} checked={false}
            style={true ? { filter: 'brightness(50%)', cursor:'default'} : null}>
            <div className='specified-user-container'>
                <div className='tip'><img src="https://oss.metopia.xyz/imgs/exclamation.svg" alt="!"/>Members who meet any of the following conditions can participate in the activity.</div>
                <div className='main-container'>

                </div>
            </div>
        </SettingsSingleChoice >

    </div >
}
export default EntriesPage