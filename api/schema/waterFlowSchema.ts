import { object, string, number } from 'yup';

export default object({
    id_message: string().required(),
    id_sensor: string().required(),
    flow: number().required(),
});
