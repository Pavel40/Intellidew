import { object, string, number } from 'yup';

export default object({
    what: string().oneOf(['temperature', 'soil_moisture', 'air_humidity', 'watering_status', 'water_flow_sum']).required(),
    time: number().integer().default(24),
});
