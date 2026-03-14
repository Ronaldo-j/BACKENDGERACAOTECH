const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'product_images',
    timestamps: false,
    underscored: true,
});

module.exports = ProductImage;
