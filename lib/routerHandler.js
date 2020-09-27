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

handlers.hobby = (data, callback) => {
    const acceptableMethods = ['get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._hobby[data.method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.age = (data, callback) => {
    const acceptableMethods = ['get'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._age[data.method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}


handlers._users = {};

//POST Method for /users
//Required Data (body): All Data
//Optional Data : none
//It is a private route, only logged in users can query user data
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

//GET Method for /users
//Required Data (Query): Phone Number
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._users.get = (data, callback) => {
    if(typeof data.queryString.phoneNumber === 'string') {
        
        //Logic for Getting Users Data using Query Paramenters
        const phoneNumber = data.queryString.phoneNumber.length === 10 ? data.queryString.phoneNumber : false;
        if(phoneNumber) {
            dataHandler.read('users', phoneNumber, (err, fileData) => {
                if(!err && fileData) {
                    delete fileData.password;
                    callback(200, fileData);
                }
                else {
                    callback(400, {'Error' : `${err}`});
                }
            });
        }
        else {
            callback(400, {'Error' : 'Validation Failed / Missing Fields!'});
        }

    }
    else {
        console.log('Query String Empty!');
        console.log(data.queryString);
        callback(200, {'Status' : 'Inside Get'})
    }
};

handlers._users.put = (data, callback) => {
    callback(200, {'Status' : 'Inside Put'})
};

handlers._users.delete = (data, callback) => {
    callback(200, {'Status' : 'Inside Delete'})
};

handlers._hobby = {};

//PUT Method for /hobby
//Required Data (body): Hobbies
//Required Data (Query String): Phone Number
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._hobby.put = (data, callback) => {
    if(typeof data.queryString.phoneNumber === 'string') {
        data.payload = JSON.parse(data.payload);

        const phoneNumber = data.queryString.phoneNumber.length === 10 ? data.queryString.phoneNumber : false;
        let hobbies = typeof data.payload.hobbies === 'string' || Array.isArray(data.payload.hobbies) ? data.payload.hobbies : false;
        if(phoneNumber && hobbies) {
            
            hobbies = Array.isArray(data.payload.hobbies) ? data.payload.hobbies : Array(data.payload.hobbies);
            dataHandler.read('users', phoneNumber, (err, fileData) => {
                if(!err && fileData) {
                    if(Array.isArray(fileData.hobbies)) {
                        fileData.hobbies = fileData.hobbies.concat(hobbies);
                    }
                    else {
                        fileData.hobbies = hobbies;
                    }
                    console.log("fileData.hobbies", fileData.hobbies);
                    dataHandler.update('users', phoneNumber, fileData, (err) => {
                        if(!err) {
                            callback(200, {'Success' : 'Record Updated.'});
                        }
                        else {
                            callback(500, {'Error' : `${err}`});
                        }
                    })
                }
                else {
                    callback(500, {'Error' : `${err}`});
                }
            });
        }
        else {
            callback(400, {'Error' : 'Missing Required Fields!'});
        }
    }
    else {
        callback(400, {'Error' : 'Validation Failed / Missing Fields!'});
    }
}

handlers._hobby.get = (data, callback) => {
    callback(200, {'Status' : 'Inside GET!'});
}

//DELETE Method for /hobby
//Required Data (Query String): Phone Number, Hobby
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._hobby.delete = (data, callback) => {
    const phoneNumber = typeof data.queryString.phoneNumber === 'string' && data.queryString.phoneNumber.length === 10 ? data.queryString.phoneNumber : false;
    const hobby = typeof data.queryString.hobby === 'string' ? data.queryString.hobby : false;

    if(phoneNumber && hobby) {
        dataHandler.read('users', phoneNumber, (err, fileData) => {
            if(!err && fileData) {
                let pos = fileData.hobbies.indexOf(hobby);
                if(pos > -1) {
                    fileData.hobbies.splice(pos, 1);
                    if(fileData.hobbies.length === 0)
                        delete fileData.hobbies;
                    dataHandler.update('users', phoneNumber, fileData, (err) => {
                        if(!err)
                            callback(200, {'success' : 'Hobbies Updated.'});
                        else
                            callback(500, {'Error' : `${err}`});
                    })
                }  
                else {
                    callback(400, {'Error' : 'The Hobby Doesnt Exist.'});
                }
            }
            else {
                callback(400, {'Error' : `${err}`});
            }
        })
    }
    else {
        callback(400, {'Error' : 'Validation Failed / Missing Fields.'});
    }
}


handlers._age = {};

//GET Method for /age
//Required Data (Query String): Phone Number
//Optional Data : none
//It is a private route, only logged in users can query user data
handlers._age.get = (data, callback) => {
    const phoneNumber = typeof data.queryString.phoneNumber === 'string' && data.queryString.phoneNumber.length === 10 ? data.queryString.phoneNumber : false;

    if(phoneNumber) {
        dataHandler.read('users', phoneNumber, (err, fileData) => {
            if(!err && fileData) {
                const bornTime = fileData._id;
                const nowTime = (new Date()).getTime();
                let age = nowTime - bornTime;
                age = helpers.findAge(age);
                callback(200, {'Success' : `The Age is ${age.time.toFixed(2)} ${age.unit}`});
            }
            else {
                callback(400, {'Error' : `${err}`});
            }
        });
    }
    else {
        callback(400, {'Error' : 'Validation Failed'});
    }
}


handlers.notFound = (data, callback) => {
    callback(404, {'Error' : 'Not Found!'});
}

module.exports = handlers;