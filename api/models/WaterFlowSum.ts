import db from '../lib/db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

interface WaterFlowSumModel
    extends Model<InferAttributes<WaterFlowSumModel>, InferCreationAttributes<WaterFlowSumModel>> {
    sensorID: string;
    flow_sum: number;

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<WaterFlowSumModel>('water_flow_sum', {
    sensorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flow_sum: {
        type: DataTypes.BIGINT,
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
