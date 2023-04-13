const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const Product = sequelize.define('product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gallery: {
            type: DataTypes.JSON,
            allowNull: false
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false
        },
        colors: {
            type: DataTypes.JSON,
            allowNull: false
        },
        printLocation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        style: {
            type: DataTypes.STRING,
            allowNull: false
        },
        styleDescription: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ratingValue: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        bestRating: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ratingCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        site: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'crawl_site' // Khai báo unique constraint cho crawlId và site
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        crawlId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'crawl_site' // Khai báo unique constraint cho crawlId và site
        },
        crawl_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pushedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });
    return Product;
};
