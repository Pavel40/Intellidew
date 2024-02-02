import { object, string, number } from 'yup';

export default object({
    action: string().oneOf(['turn_on', 'turn_off']).required(),
    duration: number().when('action', {
        is: 'turn_on',
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
    }),
});
