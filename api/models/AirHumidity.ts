import db from '../lib/db';
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface AirHumidityModel extends Model<InferAttributes<AirHumidityModel>, InferCreationAttributes<AirHumidityModel>> {
    sensorID: string;
    air_humidity: number;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<AirHumidityModel>('air_humidity', {
    sensorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    air_humidity: {
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
