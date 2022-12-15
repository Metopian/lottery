import React from 'react'
import { FormGroup, ImageSelector, Input, Label, NumberInput, Textarea } from '../../../../../component/form'
import SettingsOption from '../../../../../component/SettingsOption'
import { uploadFileToIfps } from '../../../../../utils/ipfsUtils'
import './index.scss'

const GeneralForm = (props: { data, onChange, cachedSBTImage, setCachedSBTImage }) => {
    const { data, onChange, cachedSBTImage, setCachedSBTImage } = props

    return <SettingsOption title="General rewards"
        onActive={() => {
        }} onDeactive={() => {
        }}
        defaultHeight={150} expand={true} className="sbt-setting-option">
        <>
            {/* <FormGroup>
                <Label>Introduction</Label>
                <Textarea value={data.reward[0]?.params?.description}
                    maxLength={70} onChange={e => {
                        let reward = data.reward[0]
                        reward.params.description = e.target.value.trim()
                        onChange({ reward: [reward] })
                    }} />
            </FormGroup> */}
            <FormGroup className={'sbt-num-group'}>
                <Label required="true">Num</Label>
                <NumberInput
                    minValue={1}
                    defaultValue={1}
                    value={data.reward[0].supply} setValue={(val) => {
                        let reward = data.reward[0]
                        reward.supply = val
                        onChange({ reward: [reward] })
                    }} />
            </FormGroup>
        </>
    </SettingsOption >
}

export default GeneralForm