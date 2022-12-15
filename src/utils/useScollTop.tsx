import { useCallback, useEffect, useState } from 'react';

export const useScrollTop = (): [number, boolean] => {

    const [atBottom, setAtBottom] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)

    const handleScroll = useCallback(() => {
        const position = window.pageYOffset;
        setScrollTop(position);
        if (window.innerHeight + position >= document.getElementById('root').clientHeight - 1) {
            if (!atBottom)
                setAtBottom(true)
        } else {
            if (atBottom)
                setAtBottom(false)
        }
    }, [atBottom])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return [scrollTop, atBottom]
}
