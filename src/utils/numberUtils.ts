const numberToLetter = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    } else {
        return num
    }
}

function toFixedIfNecessary(value, dp): number {
    return value ? +parseFloat(value).toFixed(dp) : 0
}
export function removeUnecessaryZero(value, dp) {
    return +parseFloat(value).toFixed(dp);
}

const sum = (array, keyword?: string) => {
    return array?.reduce((total, item) => {
        let temp = keyword ? item[keyword] : item
        if (isNaN(temp))
            temp = 0
        return total + temp
    }, 0) || 0
}

/**
 * @returns Minimum value = 0
 */
const max = (array, keyword?: string) => {
    if (!array?.length)
        return 0
    else
        return array.reduce((maxVal, item) => {
            if (keyword) {
                if (item[keyword] > maxVal)
                    maxVal = item[keyword]
            } else {
                if (item > maxVal)
                    maxVal = item
            }
            return maxVal
        }, -1)
}

const calcDecimal = (value: number, decimal: number) => {
    let res = value
    for (let i = 0; i < decimal; i++) {
        res /= 10
    }
    return res
}


export { numberToLetter, toFixedIfNecessary, sum, max, calcDecimal }