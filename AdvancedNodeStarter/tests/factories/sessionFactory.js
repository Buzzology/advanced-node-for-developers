const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    // This is the user's id (not google id.)
    const sessionObject = {
        passport: {
            user: user._id.toString(), // Required because mongo returns id as an object.
        }
    };

    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign(`session=${session}`);

    return {
        session,
        sig,
    }
}