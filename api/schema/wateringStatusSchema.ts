import { string, object } from 'yup';

export default object({
    id_message: string().required(),
    id_sensor: string().required(),
    watering_status: string().oneOf(['Čerpadlo zapnuto.', 'Čerpadlo vypnuto.']).required(),
});
