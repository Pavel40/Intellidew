import db from '../lib/db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

interface SoilMoistureModel
    extends Model<InferAttributes<SoilMoistureModel>, InferCreationAttributes<SoilMoistureModel>> {
    sensorID: string;
    soilMoistureRaw: number;
    soilMoisturePercentage: number;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<SoilMoistureModel>('soil_moisture', {
    sensorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    soilMoistureRaw: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    soilMoisturePercentage: {
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
