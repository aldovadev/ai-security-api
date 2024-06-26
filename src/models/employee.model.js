import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import userModel from './user.model.js';

const employeeModel = db.define(
    'employeeModel',
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
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        employeeId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        photoPath: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: 'Employee',
        timestamps: true
    }
);

employeeModel.belongsTo(userModel, {
    foreignKey: 'companyId',
    as: 'company'
});

export default employeeModel;
