const fs = require('fs');
const path = require('path');

const dataHandlers = {};

dataHandlers.baseDir = path.join(__dirname, '/../.data');

dataHandlers.create = (dir, file, data, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(!fs.existsSync(filePath)) {
        const stringData = JSON.stringify(data);
        fs.writeFile(filePath, stringData, (err) => {
            if(!err)
                callback(false);
            else
                callback('Error encounted while writing the file');
        });
    }
    else {
        callback('File Already Exist');
    }
};

dataHandlers.read = (dir, file, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            data = JSON.parse(data);
            if(!err && data)
                callback(false, data);
            else
                callback(err, data);
        })
    }
    else {
        callback('File Doesn\'t Exist');
    }
};

dataHandlers.update = (dir, file, data, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync(filePath)) {
        const stringData = JSON.stringify(data);
        fs.writeFile(filePath, stringData, (err) => {
            if(!err)
                callback(false);
            else
                callback('Error while Updating file!');
        });
    }
    else {
        callback("The File Doesn't Exist");
    }
};

dataHandlers.delete = (dir, file, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync()) {
        fs.unlink(filePath, (err) => {
            if(!err)
                callback(false);
            else
                callback('Error in Deleting the file!');
        })
    }
    else {
        callback('The File doesn\'t Exist');
    }
};

module.exports = dataHandlers;