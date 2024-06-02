const fetch = require('node-fetch');
const fs = require('fs-extra');

const config = fs.readJSONSync('config.json');

let lastPost = '';

const sendWebhook = (title, permalink, time) => {
  console.log(time);
  const payload = {
    headers: { 'Content-Type': 'application/json' },
    url: config.webhook,
    method: 'POST',
    json: {
      embeds: [{
        url: permalink,
        title,
        color: 0x16BE49,
        footer: {
          text: `${config.footerPrefix} @ ${time}`,
        },
      }],
    },
  };
  fetch(payload).catch(err => console.log(err));
};

const scrape = async () => {
  fetch(config.subredditURL).then((response) => {
    const json = JSON.parse(response);
    const latestPost = json.data.children[0].data.url;
    if (lastPost !== latestPost) {
      lastPost = latestPost;
      sendWebhook(json.data.children[0].data.title, lastPost, new Date(json.data.children[0].data.created_utc * 1000).toUTCString());
    }
  }).catch(err => console.log(err));
};

const run = async () => {
  setInterval(async () => {
    await scrape();
  }, 10000);
};

run();
