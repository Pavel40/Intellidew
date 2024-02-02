import { object, string, number } from 'yup';

export default object({
    id_message: string().required(),
    soil_moisture: number().required(),
    id_sensor: string().required(),
});
