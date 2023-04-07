const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('pod-crawler-io', 'root', '123@123', {
    host: '10.0.0.172',
    dialect: 'mysql'
});

const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require('fs');
const _ = require('lodash');

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
    images: {
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
});



class HtmlReader {


    async getTitle() {
        const html = await request.get(this.url);
        const $ = cheerio.load(html);
        return $('title').text().trim();
    }

    getColor(str) {
        return str.replace(" Fitted T-Shirt", "");
    }

    getCrawlId(str) {
        const pattern = /\/(\d+\.\w+)/;
        return str.match(pattern)[1];
    }

    async upsertProduct(product) {
        Product.upsert(product)
    }

    async readAndParseHTML(html) {
        const $ = cheerio.load(html);
        const scriptTags = $('script[type="application/ld+json"]');
        const ldJson = JSON.parse($('script[type="application/ld+json"]').first().html());
        const images = $('img.GalleryImage__img--2Epz2').toArray().map(img => $(img).attr('src'));
        const colors = $('.DesktopColorPicker__swatch--ODK-s').toArray().map(img => this.getColor($(img).attr('title')));
        const printLocation = $('input[name="printLocation"][checked]').next().text();
        const color = this.getColor($('.ColorSwatch__tick--2FPuM').parent().parent().attr('title'));
        const style = $('.styles__listContent--1pL_K h5').text();
        const styleDescription = $('.styles__listContent--1pL_K h6').text();
        return {
            'name': ldJson.name,
            'price': ldJson.offers.price,
            'currency': ldJson.offers.priceCurrency,
            'image': ldJson.image,
            'description': ldJson.description,
            images,
            color,
            colors,
            printLocation,
            style,
            styleDescription,
            ratingValue: ldJson.aggregateRating.ratingValue,
            bestRating: ldJson.aggregateRating.bestRating,
            ratingCount: ldJson.aggregateRating.ratingCount,
            site: 'redbubble.com',
            url: ldJson.url,
            crawlId: this.getCrawlId(ldJson.url),
        }
    }
}

// Sử dụng
sequelize.sync({ force: false }).then(() => {
    const reader = new HtmlReader();
    const html = fs.readFileSync('redbubble.com/product.html', 'utf-8');
    reader.readAndParseHTML(html).then(product => 
        reader.upsertProduct(product));
    }
)
