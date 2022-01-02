const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false,
        })

        const page = await browser.newPage();
        const customPage = new CustomPage(page, browser);

        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || page[property] || browser[property];
            }
        });
    }

    constructor(page, browser) {
        this.page = page;
        this.browser = browser;
    }

    // We want close to apply to the browser. Can just change priority instead if we want. Both options 
    // seem a bit sucky - this one less so.
    close() {
        this.browser.close();
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        // Set the cookies for the current page so that we're authenticated.
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('localhost:3000');
    }

    // getContentsOf returns contents of element for provided selector.
    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;