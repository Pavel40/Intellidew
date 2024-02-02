import db from '../lib/db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

interface WaterFlowLogModel
    extends Model<InferAttributes<WaterFlowLogModel>, InferCreationAttributes<WaterFlowLogModel>> {
    sensorID: string;
    flow: number;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<WaterFlowLogModel>('water_flow', {
    sensorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flow: {
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
