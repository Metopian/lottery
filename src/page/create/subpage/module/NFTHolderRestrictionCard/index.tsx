import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import { FormGroup, Input, Label, RadioGroup } from '../../../../../component/form';
import ChainSelector from '../../../../../component/form/ChainSelector';
import { max } from '../../../../../utils/numberUtils';
import './index.scss';


const NFTHolderRestrictionCard = (props: { data, onChange, onDelete }) => {
    const { data, onChange, onDelete } = props
    const [contractError, setContractError] = useState(null)
    const [contractName, setContractName] = useState(null)
    const [loading, setLoading] = useState(false)

    return <div className='nft-holder-restriction-card'>
        <div className='head'>
            <FormGroup style={contractName ? { marginBottom: 0 } : null}>
                <Label>NFT contract address</Label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Input
                        loading={loading ? '1' : null}
                        value={data.address?.trim() || ""}
                        className={contractError ? " error" : ''}
                        placeholder={""}
                        onChange={(e) => {
                            onChange({ address: e.target.value })
                        }} />
                    {contractError && <div className="ErrorHint" style={{ marginTop: '8px', marginBottom: '-12px' }}>{"Contract not found"}</div>}
                </div>
            </FormGroup>
        </div>
        <img src="https://oss.metopia.xyz/imgs/close-round.svg" className='close-button' onClick={onDelete} />
    </div>
}

export default NFTHolderRestrictionCard