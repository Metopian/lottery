import useSize from '@react-hook/size';
import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import ReactLoading from 'react-loading';
import './index.scss';

interface LazyLoadImageParam {
    src: string;
    alt?: string;
    className?: string;
    defaultSrc?: string
    onError?;
    style?: CSSProperties;
}

const WrappedLazyLoadImage = (image: LazyLoadImageParam) => {
    const [loading, setLoading] = useState(true)
    const containerRef = useRef(null)
    const [width, height] = useSize(containerRef)
    const [redirectedSrc, setRedirectedSrc] = useState(null)

    const src = useMemo(() => {
        let result = null
        if (image?.src?.indexOf("ipfs://") === 0)
            result = "https://metopia.mypinata.cloud/ipfs/" + image.src.substring(7, image.src.length)
        else if (image?.src?.indexOf("https://ai.metopia.xyz/data-center/nfts/image") === 0) {
            if (!redirectedSrc) {
                setRedirectedSrc('')
                fetch(image?.src).then(res => res.json()).then(res => {
                    setRedirectedSrc(res?.data?.image)
                })
            }
            result = null
        } else {
            result = image?.src
        }
        return result || redirectedSrc
    }, [image, redirectedSrc])
    
    return (
        <div className={'wrapped-lazy-load-image ' + (image.className ? image.className : '')} ref={containerRef} style={image?.style}>
            {
                <div className='wrapper'>

                    <img alt={image.alt || ''} onLoad={() => setLoading(false)}
                        src={src?.length ? src : (image.defaultSrc || 'https://oss.metopia.xyz/imgs/no-image-available.png')}
                        onError={e => {
                            image.onError && image.onError(src?.length ? src : (image.defaultSrc || 'https://oss.metopia.xyz/imgs/no-image-available.png'))
                        }} />
                </div>
            }
            {
                loading ? <ReactLoading type={'spin'} color={'#ddd'} height={Math.min(Math.min(width, height) / 2, 160)} width={Math.min(Math.min(width, height) / 2, 160)} className="loading" /> : null
            }
        </div>
    )
}


export * from './DefaultAvatar';
export { WrappedLazyLoadImage };

