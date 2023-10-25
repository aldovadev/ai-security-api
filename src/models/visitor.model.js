import { DataTypes, Model } from 'sequelize';
import db from '../config/database.js';
import userModel from './user.model.js';
import visitStatusModel from './visitStatus.model.js';

const visitorModel = db.define(
    'visitorModel',
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
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        visitReason: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        visitNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        originId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        destinationId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        photoPath: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        tableName: 'Visitor',
        timestamps: true
    }
);

visitorModel.belongsTo(userModel, {
    foreignKey: 'originId',
    as: 'origin'
});

visitorModel.belongsTo(userModel, {
    foreignKey: 'destinationId',
    as: 'destination'
});

visitorModel.belongsTo(visitStatusModel, {
    foreignKey: 'statusId',
    as: 'status'
});

export default visitorModel;
