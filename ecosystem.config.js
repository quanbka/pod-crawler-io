module.exports = {
    apps: [
        {
            name: "worker",
            script: "redbubble.com/worker.js",
            instances: 'max',
            autorestart: true,
        },
        {
            name: "pusher",
            script: "./pusher.js",
            autorestart: true,
        },
        {
            name: "get_all_sitemaps",
            script: "redbubble.com/get_all_sitemaps.js",
            autorestart: true,
            cron_restart: "0 0 * * *",
        }
    ]
}
