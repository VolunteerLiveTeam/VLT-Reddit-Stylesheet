const puppeteer = require('puppeteer');

const PAGES = require("./screenshotPages.json");

const before = process.argv.indexOf('before') !== -1;

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1800 });
        
        await page.goto("https://reddit.com/login");
        await page.focus("#user_login");
        await page.type(process.env.REDDIT_USERNAME);
        await page.focus("#passwd_login");
        await page.type(process.env.REDDIT_PASSWORD);
        await page.click(`#login-form button`);

        await page.waitForNavigation();
        console.log('Logged in.');

        try {
            await page.click(".cookie-infobar button");
        } catch (e) {
            console.error(`Couldn't click cookie button. Big deal.`);
        }

        for (const key of Object.keys(PAGES)) {
            const url = PAGES[key];
            await page.goto(url);
            await page.screenshot({ path: `screenshot-${before ? 'before' : 'after'}-${key}.png` });
        }
        console.log('Done.');
        browser.close();
        process.exit(0);
    } catch (e) {
        console.error(e);
    }
})();
