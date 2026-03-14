const { Sequelize } = require('sequelize');
const config = require('./database');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
);

module.exports = sequelize;
