import { object, string, number } from 'yup';

export default object({
    id_message: string().default(''),
    temperature: number().required(),
    id_sensor: string().required(),
});
