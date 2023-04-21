const db = require('../models/db');
const Op = db.Op;
const sequelize = db.sequelize;
const Product = db.Product;

const cheerio = require('cheerio');

function getFullImageUrl(imageUrl) {
    if (imageUrl) {
        imageUrl = imageUrl.replace(/c\/\d+\/\d+\/\d+\/\d+/, 'r');
        imageUrl = imageUrl.replace('340x270', '1588xN');
        return imageUrl;
    }
}

function getCrawlId(url) {
    const match = url.match(/\/(\d+)\//);
    if (match) {
        return match[1];
    } else {
        return null;
    }
}

async function getPage(page) {
    if (page > 17) return;
    const response = await fetch(`https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?explicit=1&category_landing_page=1&order=most_relevant&ref=pagination&page=${page}`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": "uaid=u-gh2a0FEB97uRXlb0dpQDmg77VjZACCFCfu8zC6Wqk0MTNFyUopPDAkMzjJNMmoIC-oIj8op8g508U_MMO9JDzLVKmWAQA.; user_prefs=5T1UG71c7DGTSBFbBxQ7-zVzldNjZACCFCfu8zA6Wik02EVJJ680J0dHKTVPNzRYSUcJRIBFjCAULiKWAQA.; fve=1682049999.0; ua=531227642bc86f3b5fd7103a0c0b4fd6; pla_spr=0|0|0; _gcl_au=1.1.1187769524.1682050015; _gid=GA1.2.732954751.1682050018; __pdst=46b8978f5ddc44c0b74832276bd20396; _pin_unauth=dWlkPU16ZzVNV0l6WkdZdE5XSmtOeTAwWWpFeExXSTNNV1l0WlRBMk5qRmhPV1kxTmpnNQ; _tt_enable_cookie=1; _ttp=SKsLhg2xRTJBSg1RcoQOC41xQwT; granify.new_user.qivBM=true; last_browse_page=https%3A%2F%2Fwww.etsy.com%2Fshop%2FOJEYAPPAREL; _dc_gtm_UA-2409779-1=1; _ga_KR3J610VYM=GS1.1.1682050016.1.1.1682051515.39.0.0; _ga=GA1.1.1682514741.1682050016; _uetsid=f77d49b0dff911ed9e580d8e95cd4bca; _uetvid=f77d7540dff911edb7a4dddfc35b27f2; granify.uuid=398b0b98-59de-45fd-b911-2611a7ae5011; granify.session.qivBM=-1",
            "Referer": "https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?explicit=1&category_landing_page=1&order=most_relevant",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });
    let html = await response.text();
    const $ = cheerio.load(html);
    const items = $('div.wt-bg-white.wt-display-block.wt-pb-xs-2.wt-mt-xs-0  ol .wt-list-unstyled');
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        // console.log($(item).html());
        // console.log(getFullImageUrl($(item).find('img').attr('src')));
        let product = {};
        product.name = $(item).find('h3').text().trim();
        product.image = getFullImageUrl($(item).find('img').attr('src'));
        product.url = $(item).find('a').attr('href').replace(/\?(.*)/, '');
        product.crawlId = getCrawlId(product.url);
        product.site = 'etsy.com';
        product.description = 'T-Shirt';
        product.gallery = [product.image];
        product.price = 0;
        product.currency = 'USD';
        product.tags = [];
        product.color = '';
        product.colors = [];
        product.printLocation = '';
        product.style = '';
        product.styleDescription = '';
        product.ratingValue = 0;
        product.bestRating = 5;
        product.ratingCount = 0;
        product.code = product.crawlId;
        product.crawl_code = product.crawlId;
        await Product.upsert(product);
        console.log(product);
    }
    await getPage(page+1);
}




async function main() {
    await getPage(1);
}

main();