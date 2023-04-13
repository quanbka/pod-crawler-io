const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize('pod-crawler-io', 'root', '123@123', {
    host: '10.0.0.172',
    dialect: 'mysql',
    logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Op;

// Import models
db.Product = require('./Product')(sequelize, Sequelize);

console.log(db.Product);

module.exports = db;