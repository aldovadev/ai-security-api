import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const roleModel = db.define(
    'roleModel',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'Role',
        timestamps: true
    }
);

export default roleModel;
