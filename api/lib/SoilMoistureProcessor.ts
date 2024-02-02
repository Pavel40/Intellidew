import config from './Config';

/**
 * Helper class used to parse the raw data from the soil moisture sensor to a percentage according to config.
 */
export default class SoilMoistureProcessor {
    /**
     * Stores raw values of soil moisture for different percentages for each sensor.
     *
     * It is a dictionary of raw soil moisture: percentage value pairs.
     * Each percentage is a relative percentage of water in the soil.
     * Each raw soil moisture value is the measured value by the soil moisture sensor for the corresponding relative percentage of water in the soil.
     */
    private readonly _rawSoilMoistureValues = config.soilMoistureProcessor;

    /** Returns the parsed soil moisture percentage. */
    getSoilMoisturePercentage(rawSoilMoisture: number, sensorName: string) {
        console.log('Raw soil moisture:', rawSoilMoisture);
        const rawSoilMoisturesPercentagesMapping = this._rawSoilMoistureValues[sensorName];
        const rawSoilMoistures: number[] = Object.keys(rawSoilMoisturesPercentagesMapping).map((item) =>
            parseInt(item)
        );
        const percentages: number[] = Object.values(rawSoilMoisturesPercentagesMapping);

        if (rawSoilMoistures.length == 0) {
            throw new Error('Sensor has no values configured');
        }

        // if the value has a known percentage, return the percentage
        if (rawSoilMoistures.includes(rawSoilMoisture)) {
            return this._scaleSoilMoisturePercentage(
                Math.max(...percentages),
                rawSoilMoisturesPercentagesMapping[rawSoilMoisture]
            );
        }

        // the soil moisture raw value is higher for lower soil moisture percentage
        // and lower for higher soil moisture percentage

        // check if the rawSoilMoisture is out of bounds
        if (rawSoilMoisture < Math.min(...rawSoilMoistures)) {
            return 100;
        }
        if (rawSoilMoisture > Math.max(...rawSoilMoistures)) {
            return 0;
        }

        // get two closest raw soil moisture values and their corresponding soil moisture percentages
        const { closestRawValueBelow, closestRawValueAbove } = this._getClosestRawSoilMoistures(
            rawSoilMoisture,
            sensorName
        );
        console.log('Closest raw value below:', closestRawValueBelow);
        console.log('Closest raw value above:', closestRawValueAbove);

        if (closestRawValueBelow == null) {
            return 100;
        }
        if (closestRawValueAbove == null) {
            return 0;
        }

        const closestPercentageBelow = rawSoilMoisturesPercentagesMapping[closestRawValueBelow];
        const closestPercentageAbove = rawSoilMoisturesPercentagesMapping[closestRawValueAbove];

        // calculate percentage using linear interpolation
        // formula: y = (x - x1) * (y2 - y1) / (x2 - x1) + y1
        // example:
        // raw soil moisture ... 400 ... x
        // soil moisture above ... y1 = 16 % ... x1 = 436
        // soil moisture below ... y2 = 28 % ... x2 = 270
        // y = (400 - 436) * (28 - 16) / (270 - 436) + 16 = 18.6 %
        const soilMoisturePercentage =
            ((rawSoilMoisture - closestRawValueAbove) * (closestPercentageBelow - closestPercentageAbove)) /
                (closestRawValueBelow - closestRawValueAbove) +
            closestPercentageAbove;
        console.log('Soil moisture percentage:', soilMoisturePercentage);

        return this._scaleSoilMoisturePercentage(Math.max(...percentages), soilMoisturePercentage);
    }

    private _scaleSoilMoisturePercentage(highestPercentage: number, currentPercentage: number) {
        // scale percentage to 0 - 100
        // highest percentage ... scale to 100 % ... 37 %
        // current percentage ... 25.4 %
        // example: 37 % should be 100 %
        // 25.4 % / 37 % * 100 = 68.6 %
        const scaledSoilMoisturePercentage = (currentPercentage / highestPercentage) * 100;
        console.log('Scaled soil moisture percentage:', scaledSoilMoisturePercentage);
        return Math.round(scaledSoilMoisturePercentage * 100) / 100;
    }

    private _getClosestRawSoilMoistures(rawSoilMoisture: number, sensorName: string) {
        const rawSoilMoisturesKeys = Object.keys(this._rawSoilMoistureValues[sensorName]);
        const rawSoilMoistures = rawSoilMoisturesKeys.map((item) => parseInt(item));
        const belowInput = rawSoilMoistures.filter((num) => num < rawSoilMoisture);
        const aboveInput = rawSoilMoistures.filter((num) => num > rawSoilMoisture);

        // Find the closest number below the target
        const closestRawValueBelow = belowInput.length > 0 ? Math.max(...belowInput) : null;

        // Find the closest number above the target
        const closestRawValueAbove = aboveInput.length > 0 ? Math.min(...aboveInput) : null;

        return { closestRawValueBelow, closestRawValueAbove };
    }
}
