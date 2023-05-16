const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize('pod-crawler-io', 'root', '123@123a', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: true,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Op;

// Import models
db.Product = require('./Product')(sequelize, Sequelize);

console.log(db.Product);

module.exports = db;