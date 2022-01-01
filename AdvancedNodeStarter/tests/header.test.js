const puppeteer = require('puppeteer');

let browser, page;

// Runs before each test.
beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
})

// Runs after each test.
afterEach(async () => {
    await browser.close();
})

test('Adds two numbers', () => {
    const sum = 1 + 2;

    expect(sum).toEqual(3);
})

test('the header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
})

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test.only('When signed in, shows logout button', async () => {
    // This is the user's id (not google id.)
    const id = '61ce6ff249529f15c0b9db40';
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: id,
        }
    };

    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign(`session=${sessionString}`);

    // Set the cookies for the current page so that we're authenticated.
    await page.setCookie({name: 'session', value: sessionString });
    await page.setCookie({name: 'session.sig', value: sig });
    await page.goto('localhost:3000');

    // Ensure that we're logged in by seeing if 'logout' is shown.
    await page.waitFor('a[href="/auth/logout"]');
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
})