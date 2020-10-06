const dataHandler = require('./dataHandler.js');
const UserModel = require('../model/UserModel.js');
const helpers = require('./helper.js');

const handlers = {};

handlers.users = (data) => {

    const { method } = data;

    const acceptableMethods = ['get', 'put', 'post', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        return handlers._users[method](data);
    }
    else {
        return Promise.reject({statusCode : 405, 'message' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.hobby = (data) => {
    
    const { method } = data;

    const acceptableMethods = ['get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        return handlers._hobby[method](data);
    }
    else {
        return Promise.reject({statusCode : 405, 'message' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.age = (data) => {
    
    const { method } = data;

    const acceptableMethods = ['get'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        return handlers._age[method](data);
    }
    else {
        return Promise.reject({statusCode : 405, 'message' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers.tokens = (data) => {
    const {method} = data;

    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        return handlers._tokens[data.method](data);
    }
    else {
        return Promise.reject({statusCode : 405, 'message' : 'Invalid HTTP Method. Request Failed.'});
    }
}

handlers._users = {};

//POST Method for /users
//Required Data (body): All Data
//Optional Data : none
//It is a private route, only logged in users can query user data
handlers._users.post = async (data) => {

    try {
        let { firstName, lastName, phoneNumber, email, password, tocAgreement } = JSON.parse(data.payload);

        firstName = typeof firstName === 'string' && firstName.trim().length > 0 ? firstName : false;
        lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName : false;
        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.trim().length === 10 ? phoneNumber : false;
        email = typeof email === 'string' && email.trim().length > 0 ? email : false;
        password = typeof password === 'string' && password.length > 0 ? password : false;
        tocAgreement = typeof tocAgreement === 'boolean' && tocAgreement === true ? tocAgreement : false;

        if(!(firstName && lastName && phoneNumber && email && password && tocAgreement)) {
            return Promise.reject(400, {'Error' : 'Validation Failed.'});
        }
        const hashedPassword = helpers.hash(password);

        let _user = new UserModel(firstName, lastName, phoneNumber, email, hashedPassword, tocAgreement);
        await dataHandler.create("users", phoneNumber, _user);
        return Promise.resolve({'statusCode' : 200, "message": "User Registered Successfully"});
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
};

//GET Method for /users
//Required Data (Query): Phone Number
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._users.get = async (data) => {

    try {
        let { phoneNumber } = data.queryString;

        if(typeof phoneNumber === 'string') {
            
            //Logic for Getting Users Data using Query Paramenters
            phoneNumber = phoneNumber.length === 10 ? phoneNumber : false;
            if(!phoneNumber) {
                return Promise.reject({'statusCode' : 400, "message" : 'Validation Failed / Missing Fields!'});
            }

            const fileData = await dataHandler.read('users', phoneNumber);
            if(!fileData) {
                return Promise.reject({'statusCode' : 400, "message" : "No User Found."});
            }
            delete fileData.password;
            return Promise.resolve({'statusCode' : 200, "message" : fileData});
    
        }
        else {
            //If Phone Number is not provided as a Query String, then return all the Users Data
            let allFileData = [];
            //Read all files from the "users" directory
            const files = await dataHandler.getFilesInDirectory("users");
            if(!files) {
                return Promise.reject({'statusCode' : 400, "message" : "No Users Found."});
            }
            
            for(let i=0; i<files.length; i++) {
                let fileData = await dataHandler.read('users', files[i]);
                if(!fileData) {
                    return Promise.reject({'statusCode' : 400, "message" : "No User Found."});
                }

                delete fileData.password;
                allFileData.push(fileData);
            }

            // files.forEach(async (file) => {
            //     let fileData = await dataHandler.read('users', file);
            //     if(!fileData) {
            //         return Promise.reject({'statusCode' : 400, "message" : "No User Found."});
            //     }

            //     delete fileData.password;
            //     allFileData.push(fileData);
            // });

            return Promise.resolve({'statusCode' : 200, 'message' : allFileData});
        }
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
    
};

handlers._users.put = async (data) => {

    try {
        let { firstName, lastName, password, phoneNumber } = JSON.parse(data.payload);

        phoneNumber = typeof(phoneNumber) === 'string' && phoneNumber.length === 10 ? phoneNumber.trim() : false;
        //Check for optional FIelds
        firstName = typeof(firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
        lastName = typeof(lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
        password = typeof(password) === 'string' && password.length > 6 ? password : false;
    
        if(!(phoneNumber && (firstName || lastName || password))) {
            return Promise.reject({'statusCode' : 400, 'message' : 'Missing Required Fields/Validation Error.'});
        }
        
        let userData = await dataHandler.read('users', phoneNumber);
        if(!userData) {
            return Promise.reject({'statusCode' : 400, 'message' : 'User Does not exist.'});
        }
        
        userData.firstName = firstName ? firstName : userData.firstName;
        userData.lastName = lastName ? lastName : userData.lastName;
        userData.password = password ? helpers.hash(password) : userData.hashedPassword;

        //Store the new Data tp ethe disc intp the same file
        await dataHandler.update('users', phoneNumber, userData);
        return Promise.resolve({'statusCode' : 200, "message" : "Record Updated."});
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }

    
};

handlers._users.delete = async (data) => {

    try {
        let { phoneNumber } = data.queryString;

        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;
        if(!phoneNumber) {
            return Promise.reject({'statusCode' : 400, 'message' : 'Missing Required Fields/Validation Error.'});
        }
        
        await dataHandler.delete('users', phoneNumber)
        return Promise.resolve({'statusCode' : 200, "message" : "Record Deleted Successfully."});
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
    

};

handlers._hobby = {};

//PUT Method for /hobby
//Required Data (body): Hobbies
//Required Data (Query String): Phone Number
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._hobby.put = async (data) => {

    try {
        let { phoneNumber } = data.queryString;
        let { hobbies } = data.payload;

        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false; 
        hobbies = typeof hobbies === 'string' || Array.isArray(hobbies) ? Array(hobbies) : false;

        if(!(phoneNumber && hobbies)) {
            return Promise.reject({'statusCode' : 400, 'message' : 'Missing Required Fields/Validation Error.'});
        }
            
        let fileDAta = await dataHandler.read('users', phoneNumber);
        if(!fileData) {
            return Promise.reject({'statusCode' : 400, 'message' : 'User Doesnt Exist'});
        }
        
        if(fileData.hobbies instanceof Array) {
            fileData.hobbies = fileData.hobbies.concat(hobbies);
        }
        else {
            fileData.hobbies = hobbies;
        }
        console.log("fileData.hobbies", fileData.hobbies);
        
        await dataHandler.update('users', phoneNumber, fileData);
        return Promise.resolve({'statusCode' : 200, 'message' : fileData});
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
}

handlers._hobby.get = async (data) => {
    return Promise.resolve({'statusCode' : 200, 'message' : "Inside GET"});
}

//DELETE Method for /hobby
//Required Data (Query String): Phone Number, Hobby
//Optional Data : Rest of the fields
//It is a private route, only logged in users can query user data
handlers._hobby.delete = async (data) => {

    try {
        let { phoneNumber, hobby } = data.queryString;

        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;
        hobby = typeof hobby === 'string' ? hobby : false;
    
        if(!(phoneNumber && hobby)) {
            return Promise.reject({'statusCode': 400, 'message' : 'Validation Failed / Missing Fields.'});
        }

        let fileData = await dataHandler.read('users', phoneNumber);
        if(!fileData) {
            return Promise.reject({'statusCode' : 400, 'message' : "User Doesnt exist"});
        }
        
        let pos = fileData.hobbies.indexOf(hobby);
        if(pos < 0) {
            return Promise.reject({'statusCode' : 400, 'message' : 'The Hobby Doesnt Exist.'});
        }

        fileData.hobbies.splice(pos, 1);
        if(fileData.hobbies.length === 0)
            delete fileData.hobbies;
        await dataHandler.update('users', phoneNumber, fileData);
        return Promise.reject({'statusCode' : 200, 'message' : 'Hobbies Updated.'});
        
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }    
}


handlers._age = {};

//GET Method for /age
//Required Data (Query String): Phone Number
//Optional Data : none
//It is a private route, only logged in users can query user data
handlers._age.get = async (data) => {

    try {
        let { phoneNumber } = data.queryString;

        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.length === 10 ? phoneNumber : false;
    
        if(!phoneNumber) {
            return Promise.reject({'statusCode' : 400, 'message' : 'Validation Failed / Missing Fields.'});
        }

        let fileData = await dataHandler.read('users', phoneNumber);
        if(!fileData) {
            return Promise.reject({'statusCode' : 400, 'message' : "User Doesnt exist"});
        }
        
        const bornTime = fileData._id;
        const nowTime = (new Date()).getTime();
        let age = nowTime - bornTime;
        age = helpers.findAge(age);
        return Promise.reject({'statusCode' : 200, 'message' : `The Age is ${age.time.toFixed(2)} ${age.unit}`});
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
    
}

handlers._tokens = {};

handlers._tokens.post = async (data) => {

    try {
        let { phoneNumber, password } = JSON.parse(data.payload);

        phoneNumber = typeof phoneNumber === 'string' && phoneNumber.trim().length === 10 ? phoneNumber.trim() : false;
        password = typeof password === 'string' && password.length >= 6 ? password : false;
    
        if(!(phoneNumber && password)) {
            return Promise.reject({'statusCode': 400, 'message' : 'Validation Error'});
        }
        let userData = await dataHandler.read('users', phoneNumber);
        if(!userData) {
            return Promise.reject({'statusCode' : 400, 'message' : "No User Found with this phone number."});
        }
        
        const hashedPassword = helpers.hash(password);
        if(!(hashedPassword === userData.password)) {
            return Promise.reject({'statusCode' : 400, 'message' : 'Authentication Failed. Wrong Password.'});
        }

        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + 1000*60*60;
        const tokenObject = {
            phoneNumber,
            tokenId,
            expires
        }
        await dataHandler.create('tokens', tokenId, tokenObject);
        return Promise.resolve({'statusCode' : 200, 'message' : tokenObject});
        
    }
    catch(err) {
        console.error(err);
        return Promise.reject({'statusCode' : 400, "message" : `${err}`});
    }
}

handlers.notFound = (data) => {
    return Promise.reject({'statusCode' : 404, 'message' : 'Not Found!'});
}

module.exports = handlers;