import db from '../lib/db';
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface SettingsModel extends Model<InferAttributes<SettingsModel>, InferCreationAttributes<SettingsModel>> {
    automation_active: boolean;
    sensorAvailabilityCheckActive: boolean;
    autoSummaryGenerationActive: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<SettingsModel>('settings', {
    automation_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    sensorAvailabilityCheckActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    autoSummaryGenerationActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
});
