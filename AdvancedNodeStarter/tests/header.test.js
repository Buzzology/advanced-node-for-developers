const Page = require('./helpers/page');

let page;

// Runs before each test.
beforeEach(async () => {    
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

// Runs after each test.
afterEach(async () => {
    await page.close();
})

test('Adds two numbers', () => {
    const sum = 1 + 2;

    expect(sum).toEqual(3);
})

test('the header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
})

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows logout button', async () => {    
    await page.login();

    // Ensure that we're logged in by seeing if 'logout' is shown.
    await page.waitFor('a[href="/auth/logout"]');
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
})