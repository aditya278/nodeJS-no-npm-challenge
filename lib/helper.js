const { kStringMaxLength } = require('buffer');
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

helpers.createRandomString = (strLength) => {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if(strLength) {
        let str = '';
        let c = '';
        for(let i=0; i<20; i++) {
            c = Math.floor(Math.random()*36).toString(36);
            c = Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase();
            str += c;
        }
        return str;
    }
    else {
        return false;
    }
}

module.exports = helpers;