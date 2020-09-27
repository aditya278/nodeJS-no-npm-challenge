const dataHandler = require('./dataHandler.js');
const UserModel = require('../model/UserModel.js');
const helpers = require('./helper.js');

const handlers = {};

handlers.users = (data, callback) => {
    const acceptableMethods = ['get', 'put', 'post', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers._users = {};

handlers._users.post = (data, callback) => {
    
    data.payload = JSON.parse(data.payload);

    const firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
    const lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
    const phoneNumber = typeof data.payload.phoneNumber === 'string' && data.payload.phoneNumber.trim().length === 10 ? data.payload.phoneNumber : false;
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 0 ? data.payload.email : false;
    const password = typeof data.payload.password === 'string' && data.payload.password.length > 0 ? data.payload.password : false;
    const tocAgreement = typeof data.payload.tocAgreement === 'boolean' && data.payload.tocAgreement === true ? data.payload.tocAgreement : false;

    if(firstName && lastName && phoneNumber && email && password && tocAgreement) {
        const hashedPassword = helpers.hash(password);
        if(hashedPassword) {
            let _user = new UserModel(firstName, lastName, phoneNumber, email, hashedPassword, tocAgreement);
            dataHandler.create("users", phoneNumber, _user, (err) => {
                if(!err)
                    callback(200, {"Success": "User Registered Successfully"});
                else
                    callback(400, {"Error" : `${err}`});
            })
        }
        else {
            callback(500, {'Error' : 'Could not hash the password'});
        }
    }
    else {
        callback(400, {'Error' : 'Validation Failed.'});
    }
};

handlers._users.get = (data, callback) => {
    callback(200, {'Status' : 'Inside Get'})
};

handlers._users.put = (data, callback) => {
    callback(200, {'Status' : 'Inside Put'})
};

handlers._users.delete = (data, callback) => {
    callback(200, {'Status' : 'Inside Delete'})
};

handlers.notFound = (data, callback) => {
    callback(404, {'Error' : 'Not Found!'});
}

module.exports = handlers;