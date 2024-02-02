import db from '../lib/db';
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface TemperatureModel extends Model<InferAttributes<TemperatureModel>, InferCreationAttributes<TemperatureModel>> {
    sensorID: string;
    temperature: number;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<TemperatureModel>('temperature', {
    sensorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    temperature: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
});
