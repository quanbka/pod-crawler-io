const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

var amqp = require('amqplib/callback_api');






function convertToSlug(str) {
    return str.replace('https://www.redbubble.com/sitemap/', 'redbubble.com/sitemap/');
}

const downloadAndReadFile = async (url, filePath) => {
    try {
        // Kiểm tra xem file đã tồn tại chưa
        if (!fs.existsSync(filePath)) {
            console.log(`Downloading file from URL: ${url}`);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            // Ghi nội dung vào file
            fs.writeFileSync(filePath, response.data);
            console.log(`File downloaded and saved at: ${filePath}`);
        } else {
            console.log(`File already exists at: ${filePath}`);
        }
        // Đọc nội dung từ file
        const fileData = fs.readFileSync(filePath, 'utf-8');
        return fileData;
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

async function parseSitemapData(xmlData) {
    const result = await xml2js.parseStringPromise(xmlData);
    // console.log(result);
    if (result.sitemapindex) {
        let links = result.sitemapindex.sitemap.map(url => url.loc[0]);
        return [links, []];
    }
    if (result.urlset) {
        let links = result.urlset.url.map(url => url.loc[0]);
        // console.log(links);
        return [[], links];
    }
}

async function run(url, channel) {
    console.log("Running", url);
    let file = convertToSlug(url);
    let xmlData = await downloadAndReadFile(url, file);
    let [sitemapUrls, urls] = await parseSitemapData(xmlData);
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        // url = "https://www.redbubble.com/i/t-shirt/Dreamy-water-potion-with-wizard-frog-by-Rihnlin/134069844.FB110";
        console.log("Send to queue ", url);
        channel.sendToQueue('redbubble.com', Buffer.from(url));
    }
    for (let i = 0; i < sitemapUrls.length; i++) {
        let url = sitemapUrls[i];
        await run(url, channel);
    }

}



amqp.connect('amqp://127.0.0.1', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        let url = 'https://www.redbubble.com/sitemap/index-sitemap.xml';
        var queue = 'redbubble.com';

        channel.assertQueue(queue, {
            durable: false
        });

 
        run('https://www.redbubble.com/sitemap/popular_t-shirt-index.xml', channel);
        run('https://www.redbubble.com/sitemap/popular_graphic-t-shirt-dress-index.xml', channel);
        run('https://www.redbubble.com/sitemap/popular_active-tshirt-index.xml', channel);
        // run('url', channel);

    });
});