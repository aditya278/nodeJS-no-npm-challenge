const dataHandler = require('./dataHandler.js');
const UserModel = require('../model/UserModel.js');
const helpers = require('./helper.js');

const handlers = {};

handlers.users = (data, callback) => {

    const { method } = data;

    const acceptableMethods = ['get', 'put', 'post', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.hobby = (data, callback) => {
    
    const { method } = data;

    const acceptableMethods = ['get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._hobby[method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.age = (data, callback) => {
    
    const { method } = data;

    const acceptableMethods = ['get'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._age[method](data, callback);
    }
    else {
        callback(405, {'Error' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.tokens = (data, callback) => {
    const {method} = data;

    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }
    else {
        callback(405, {"Error" : "Imvalid HTTP Method. Request Failed."});
    }
}

handlers._users = {};

//POST Method for /users
//Required Data (body): All Data
//Optional Data : none
//It is a private route, only logged in users can query user data
handlers._users.post = (data, callback) => {

    let { firstName, lastName, phoneNumber, email, password, tocAgreement } = JSON.parse(data.payload);

    firstName = typeof firstName === 'string' && firstName.trim().length > 0 ? firstName : false;
    lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName : false;
    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.trim().length === 10 ? phoneNumber : false;
    email = typeof email === 'string' && email.trim().length > 0 ? email : false;
    password = typeof password === 'string' && password.length > 0 ? password : false;
    tocAgreement = typeof tocAgreement === 'boolean' && tocAgreement === true ? tocAgreement : false;

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

    let { phoneNumber } = data.queryString;

    if(typeof phoneNumber === 'string') {
        
        //Logic for Getting Users Data using Query Paramenters
        phoneNumber = phoneNumber.length === 10 ? phoneNumber : false;
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
        //If Phone Number is not provided as a Query String, then return all the Users Data
        let allFileData = [];
        let fileCount = 0;
        //Read all files from the "users" directory
        dataHandler.getFilesInDirectory("users", (err, files) => {
            if(!err && files) {
                files.forEach(file => {
                    dataHandler.read('users', file, (err, fileData) => {
                        if(!err && fileData) {
                            
                            delete fileData.password;
                            allFileData.push(fileData);
                            fileCount++;

                            if(files.length === fileCount)
                                callback(200, allFileData);
                        }
                        else {
                            callback(400, {'Error' : `${err}`});
                        }
                    });
                });
            }
            else {
                callback(400, `${err}`);
            }
        })
    }
};

handlers._users.put = (data, callback) => {
    let { firstName, lastName, password, phoneNumber } = JSON.parse(data.payload);

    phoneNumber = typeof(phoneNumber) === 'string' && phoneNumber.length === 10 ? phoneNumber.trim() : false;
    //Check for optional FIelds
    firstName = typeof(firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof(lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    password = typeof(password) === 'string' && password.length > 6 ? password : false;

    if(phoneNumber) {
        if(firstName || lastName || password) {
            dataHandler.read('users', phoneNumber, (err, userData) => {
                if(!err && userData) {
                    //Update the Fields
                    if(firstName) { 
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password);;
                    }

                    //Store the new Data tp ethe disc intp the same file
                    dataHandler.update('users', phoneNumber, userData, (err) => {
                        if(!err) {
                            callback(200, {'success' : 'Record Updated!'});
                        }
                        else {
                            callback(500, {'Error' : `${err}`});
                        }
                    });

                }
                else {
                    callback(400, {'Error' : 'The Specified User Doesnt exist.'});
                }
            });
        }
    }
};

handlers._users.delete = (data, callback) => {
    let { phoneNumber } = data.queryString;

    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;
    if(phoneNumber) {
        dataHandler.delete('users', phoneNumber, (err) => {
            if(!err) {
                callback(200, {"Success" : "User Deleted Successfully"});
            }
            else {
                callback(500, {"Error" : `${err}`});
            }
        });
    }
    else {
        callback(400, {"Error" : "Validation Failed / Missing Fields!"});
    }

};

handlers._hobby = {};

//PUT Method for /hobby
//Required Data (body): Hobbies
//Required Data (Query String): Phone Number
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._hobby.put = (data, callback) => {

    let { phoneNumber } = data.queryString;

    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;

    if(phoneNumber) {

        let { hobbies } = data.payload;

        hobbies = typeof hobbies === 'string' || Array.isArray(hobbies) ? Array(hobbies) : false;
        
        if(hobbies) {
            
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

    let { phoneNumber, hobby } = data.queryString;

    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;
    hobby = typeof hobby === 'string' ? hobby : false;

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

    let { phoneNumber } = data.queryString;

    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;

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

handlers._tokens = {};

handlers._tokens.post = (data, callback) => {

    let { phoneNumber, password } = JSON.parse(data.payload);

    phoneNumber = typeof phoneNumber === 'string' && phoneNumber.trim().length === 10 ? phoneNumber.trim() : false;
    password = typeof password === 'string' && password.length >= 6 ? password : false;

    if(phoneNumber && password) {
        dataHandler.read('users', phoneNumber, (err, userData) => {
            if(!err && userData) {
                const hashedPassword = helpers.hash(password);
                if(hashedPassword === userData.password) {
                    const tokenId = helpers.createRandomString(20);
                    if(tokenId) {
                        const expires = Date.now() + 1000*60*60;
                        const tokenObject = {
                            phoneNumber,
                            tokenId,
                            expires
                        }
                        dataHandler.create('tokens', tokenId, tokenObject, (err) => {
                            if(!err) {
                                callback(200, tokenObject);
                            }
                            else {
                                callback(500, {'Error' : 'Server Error.'});
                            }
                        })
                    }
                    else {
                        callback(500, {'Error' : 'Server Error'});
                    }
                }
                else {
                    callback(400, {'Error' : 'Authentication Failed. Wrong Password.'});
                }
            }
            else {
                callback(400, {'Error' : `${err}`});
            }
        });
    }
    else {
        callback(400, {'Error' : 'Validation Error'});
    }
    
}

handlers.notFound = (data, callback) => {
    callback(404, {'Error' : 'Not Found!'});
}

module.exports = handlers;