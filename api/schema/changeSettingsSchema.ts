import { object, boolean } from 'yup';

export default object({
    automation_active: boolean(),
    sensor_availability_check_active: boolean(),
    auto_summary_generation_active: boolean(),
});
