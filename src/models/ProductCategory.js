const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const ProductCategory = sequelize.define('ProductCategory', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
}, {
    tableName: 'product_categories',
    timestamps: false,
    underscored: true,
});

module.exports = ProductCategory;
