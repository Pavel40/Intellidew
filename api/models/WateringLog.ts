import db from '../lib/db';
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

interface WateringLogModel extends Model<InferAttributes<WateringLogModel>, InferCreationAttributes<WateringLogModel>> {
    status: 'on' | 'off';

    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
}

export default db.define<WateringLogModel>('watering_log', {
    status: {
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
