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

helpers.findAge = (timeInMS) => {
    let time = timeInMS / 1000;
    let unit = 'seconds';
    if(time > 60) {
        time = time / 60;
        unit = 'minutes';
        if(time > 60) {
            time = time / 60;
            unit = 'hours';
            if(time > 24) {
                time = time / 24;
                unit = 'days';
                if(time > 7) {
                    time = time / 7;
                    unit = 'weeks';
                }
            }
        }
    }
    return {'time': time, 'unit': unit};
}

module.exports = helpers;