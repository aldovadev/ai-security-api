import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import visitStatusModel from './visitStatus.model.js';
// import visitorModel from './visitor.model.js';

const trackingModel = db.define(
    'trackingModel',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        visitorId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        visitNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        statusFrom: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        statusTo: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'Tracking',
        timestamps: true
    }
);

trackingModel.belongsTo(visitStatusModel, {
    foreignKey: 'statusFrom',
    as: 'from'
});

trackingModel.belongsTo(visitStatusModel, {
    foreignKey: 'statusTo',
    as: 'to'
});

// trackingModel.belongsTo(visitorModel, {
//     foreignKey: 'visitorId',
//     as: 'visitor'
// });

export default trackingModel;
