const Parse = require('./parse');
const parse = new Parse();


var amqp = require('amqplib/callback_api');
amqp.connect('amqp://10.0.0.172', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'redbubble.com';
        channel.prefetch(1);

        channel.assertQueue(queue, {
            durable: false
        });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, async function (msg) {
            // console.log(" [x] Received %s", );
            await parse.crawl(msg.content.toString());
            // console.log(msg.content.toString());
            channel.ack(msg);
        }, {
            noAck: false
        });
    });
});