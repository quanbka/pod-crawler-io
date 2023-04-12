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
    let file = convertToSlug(url);
    let xmlData = await downloadAndReadFile(url, file);
    let [sitemapUrls, urls] = await parseSitemapData(xmlData);
    for (let i = 0; i < sitemapUrls.length; i++) {
        let url = sitemapUrls[i];
        await run(url, channel);
    }
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        channel.sendToQueue('redbubble.com', Buffer.from(url));
    }
}



amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        const url = 'https://www.redbubble.com/sitemap/index-sitemap.xml';
        var queue = 'hello';

        channel.assertQueue(queue, {
            durable: false
        });

        run(url, channel);

    });
});