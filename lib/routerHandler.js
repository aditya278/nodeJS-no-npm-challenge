

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
    callback(200, {'Status' : 'Inside Post'});
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