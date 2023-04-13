const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('pod-crawler-io', 'root', '123@123', {
    host: '10.0.0.172',
    dialect: 'mysql',
    logging: false // Tắt log của Sequelize

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
});

const FailedUrl = sequelize.define('failed_url', {
    url: { type: Sequelize.STRING, allowNull: false },
    error: { type: Sequelize.TEXT, allowNull: true },
});



class Parse {

    async validate(url) {
        if (url.includes('/shop/')) {
            console.log("Không phải link sản phẩm");
            return false;
        }
        if (url.includes('/g/')) {
            console.log("Không phải link sản phẩm");
            return false;
        }
        const product = await Product.findOne({ where: { url } });
        if (product) {
            console.log("Sản phẩm vừa được crawl");
            return false;
        }
        const failedUrl = await FailedUrl.findOne({ where: { url } });
        if (failedUrl) {
            console.log("Link này bị lỗi từ trước rồi");
            return false;
        }


        return true;
    }

    async crawl(url) {
        console.log(url);

        try {
            if (await this.validate(url) == false) {
                return false;
            }
            // console.log("Link hợp lệ, đang lấy html");
            const html = await request.get(url);
            // console.log("Đã lấy html xong");
            // console.log(html);
            let product = await this.readAndParseHTML(html);
            // console.log(product);
            await this.upsertProduct(product);
        } catch (error) {
            await FailedUrl.create({
                url, 
                error: error.message,
                stackTrace: error.stack,
            });
            if (error.statusCode === 404) {
                console.log("Link 404");
                return;
            }
            console.error(error);
        }

    }

    async getTitle() {
        const html = await request.get(this.url);
        const $ = cheerio.load(html);
        return $('title').text().trim();
    }

    getColor(str, style = '') {
        if (!str) return '';
        return str.replace(style, '');
    }

    getCrawlId(str) {
        const pattern = /\/(\d+\.\w+)/;
        return str.match(pattern)[1];
    }

    getCrawlCode(str) {
        return str.replace("https://www.redbubble.com/i/", "");
    }

    async upsertProduct(product) {
        try {
            await Product.upsert(product)
        } catch (error) {
            console.log(product);
            console.log(error);
        }

    }

    async readAndParseHTML(html) {
        const $ = cheerio.load(html);
        const scriptTags = $('script[type="application/ld+json"]');
        const ldJson = JSON.parse($('script[type="application/ld+json"]').first().html());
        const style = $('.styles__listContent--1pL_K h5').text();
        const gallery = $('img.GalleryImage__img--2Epz2').toArray().map(img => $(img).attr('src'));
        const colors = $('.DesktopColorPicker__swatch--ODK-s').toArray().map(img =>
            this.getColor($(img).attr('title'), style)
        );
        const printLocation = $('input[name="printLocation"][checked]').next().text();
        const color = this.getColor($('.ColorSwatch__tick--2FPuM').parent().parent().attr('title'), style);

        const styleDescription = $('.styles__listContent--1pL_K h6').text();
        const tags = $('#product-tags span').toArray().map(span => $(span).text());
        return {
            'name': ldJson.name,
            'price': ldJson.offers.price,
            'currency': ldJson.offers.priceCurrency,
            'image': ldJson.image,
            'description': ldJson.description,
            gallery,
            tags,
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
            crawl_code: this.getCrawlCode(ldJson.url),
        }
    }
}

// sequelize.sync({ force: false }).then(() => {
// const reader = new Parse();

// (async function() {
//     await reader.crawl('https://www.redbubble.com/i/sticker/Rudy-Pankow-and-Drew-Starkey-Sticker-by-RachelGreeley/58173280.EJUG5');
//     await reader.crawl('https://www.redbubble.com/i/t-shirt/Dreamy-water-potion-with-wizard-frog-by-Rihnlin/134069844.FB110');
// })();

// });

module.exports = Parse;
