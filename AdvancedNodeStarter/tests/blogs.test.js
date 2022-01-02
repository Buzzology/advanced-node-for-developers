const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    page.close();
});

describe('When logged in', async () => {
    beforeEach(async() => {
        await page.login('localhost:3000/blogs');
        await page.click('a.btn-floating');
    })

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('and using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        });

        test('Submitting takes a user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries')
        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const cardTitle = await page.getContentsOf('.card-title');
            const cardContent = await page.getContentsOf('.card-content p');

            expect(cardTitle).toEqual('My Title');
            expect(cardContent).toEqual('My Content');
        });
    })

    describe('and using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    })
})

describe('User is not logged in', async () => {
    test('they cannot create a blog post', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'My Title', content: 'My Content' })
            }).then(res => res.json());
        });

        expect(result).toEqual({ error: 'You must log in!' });
    })

    test.only('they cannot get a list of posts', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => res.json());
        });

        expect(result).toEqual({ error: 'You must log in!' });
    });
})