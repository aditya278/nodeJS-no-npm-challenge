const fs = require('fs');
const path = require('path');
const util = require('util');

const dataHandlers = {};

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);

dataHandlers.baseDir = path.join(__dirname, '/../.data');

dataHandlers.create = async (dir, file, data, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(!fs.existsSync(filePath)) {
        const stringData = JSON.stringify(data);
        try {
            await writeFile(filePath, stringData);
            callback(false);
        }
        catch(err) {
            callback(err);
        }
    }
    else {
        callback('File Already Exist');
    }
};

dataHandlers.read = async (dir, file, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync(filePath)) {
        try {
            let data = await readFile(filePath, 'utf-8');
            data = JSON.parse(data);
            callback(false, data);
        }
        catch(err) {
            callback(err, null);
        }
    }
    else {
        callback('File Doesn\'t Exist');
    }
};

dataHandlers.update = async (dir, file, data, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync(filePath)) {
        const stringData = JSON.stringify(data);
        try {
            await writeFile(filePath, stringData);
            callback(false);
        }
        catch(err) {
            callback(err);
        }
    }
    else {
        callback("The File Doesn't Exist");
    }
};

dataHandlers.delete = async (dir, file, callback) => {
    const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
    if(fs.existsSync(filePath)) {
        try {
            await unlink(filePath);
            callback(false);
        }
        catch(err) {
            callback(err);
        }
    }
    else {
        callback('The File doesn\'t Exist');
    }
};

dataHandlers.getFilesInDirectory = async (dir, callback) => {

    const dirPath = `${dataHandlers.baseDir}/${dir}`;
    let allUsers = [];
    try {
        let files = await readdir(dirPath);
        files.forEach(file => {
            allUsers.push(file.split('.')[0]);
        })
        callback(false, allUsers);
    }
    catch(err) {
        callback(err, null);
    }
}

module.exports = dataHandlers;