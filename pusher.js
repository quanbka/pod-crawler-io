const db = require('./models/db');
const Op = db.Op;
const sequelize = db.sequelize;
const Product = db.Product;
const axios = require('axios');

async function sendProductsToAPI() {
    let product;
    do {
        product = await Product.findOne({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { pushedAt: null },
                            { pushedAt: { [Op.lt]: sequelize.col('updatedAt') } }
                        ]
                    },
                    { description: 'T-Shirt' },
                ]
            }
        });
        console.log(product);
        await postToAPI(product);
        product.pushedAt = new Date();
        await product.save();
        // product = null;
        // console.log(product.id);
    } while (product)




}

sendProductsToAPI();

async function getCategoryId(product) {
    switch (product.description) {
        case 'Essential T-Shirt':
            return 7;
        case 'T-Shirt':
            return 7;
        default:
            break;
    }
    return;
}

async function postToAPI(product) {

    console.log(`Đang push sản phẩm có id ${product.id}`);
    let category_id = await getCategoryId(product);
    if (category_id) {
        await push(product, category_id);
    } else {
        console.log("Danh mục chưa hỗ trợ");
    }

}

async function push(product, category_id) {
    // console.log("Pushing");
    let design_crawl_code = get_design_crawl_code(product.url)
    let site = product.site.replace('.com', '');
    let tags = product.tags.filter(tag => tag !== "T-Shirts Tags" && tag !== "t-shirts");
    tags = tags.map(tag => tag.replace(/t-shirts/ig, '').trim()).filter(tag => tag !== '');


    let data = {
        ...product.dataValues,
        category_id,
        design_crawl_code,
        site,
        tags
    }
    // console.log(data);
    // console.log(category_id);
    try {
        let response = await axios.post('https://printerval.com/crawl-product/simple-crawl', data);
        console.log(response.data);
    } catch (error) {
        console.log(error)
    }

    // console.log(response.data.status + ' ' + response.data.result.id);


}

function get_design_crawl_code(url) {
    const regex = /\/(\d+)\.\w+$/;
    const result = regex.exec(url);
    let code;
    if (result) {
         code = result[1];
    } else {
         code = url;
    }
    
    return code;
}