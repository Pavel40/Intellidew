import db from '../lib/db';
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface StatusLogModel extends Model<InferAttributes<StatusLogModel>, InferCreationAttributes<StatusLogModel>> {
    sensorID: string;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<StatusLogModel>('status_log', {
    sensorID: {
        type: DataTypes.STRING,
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
