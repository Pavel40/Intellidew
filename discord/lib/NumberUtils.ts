class NumberUtils {
    /**
     * Replaces the dot decimal separator in a float with a comma decimal separator.
     *
     * @param floatToFormat number
     * @returns string
     */
    static czechLocalizedFloat(floatToFormat: number) {
        // round to one decimal place
        const rounded = Math.round(floatToFormat * 10) / 10;
        // use comma as decimal separator
        const localized = rounded.toLocaleString('cs-CZ');

        return localized;
    }

    /**
     * Round to one decimal place, with precision of 0.5.
     *
     * eg. 1.25 -> 1.5, 1.24 -> 1, 1.26 -> 1.5, 1.5 -> 1.5, 1.51 -> 2, 1 -> 1
     *
     * @param floatToRound number
     * @returns number
     */
    static halfPrecisionRound(floatToRound: number) {
        return Math.round(floatToRound * 2) / 2;
    }
}

export default NumberUtils;
