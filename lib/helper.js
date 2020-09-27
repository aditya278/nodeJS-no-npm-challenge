const crypto = require('crypto');
const config = require('./config.js');

const helpers = {}

helpers.hash = (str) => {
    if(typeof str === 'string' && str.length > 0) {
        const hashedString = crypto.createHash('sha256', config.hashedString).update(str).digest('hex');
        return hashedString;
    }
    else {
        return false;
    }
}


module.exports = helpers;