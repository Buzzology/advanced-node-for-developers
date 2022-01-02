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

    async login(redirectUri = 'localhost:3000') {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        // Set the cookies for the current page so that we're authenticated.
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto(redirectUri);
    }

    // getContentsOf returns contents of element for provided selector.
    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    async get(url) {
        return await this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => res.json());
        }, url);
    }

    async post(path, data) {
        return await this.page.evaluate((_path, _data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            }).then(res => res.json());
        }, path, data);
    }

    async execRequests(actions) {
        return Promise.all(
            actions.map((action) => {
            if (action.method === 'get') {
                return this.get(action.path);
            } else if (action.method === 'post') {
                return this.post(action.path, action.data);
            }
        }));
    }
}

module.exports = CustomPage;