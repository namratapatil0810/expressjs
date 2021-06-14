const { Sequelize } = require('sequelize');
const mysql = require('mysql');

const sequelize = new Sequelize("mydb", "root1", "root1", {
    host: "localhost",
    dialect: "mysql",
});

module.exports = sequelize;