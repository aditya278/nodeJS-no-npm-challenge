const fs = require('fs');
const path = require('path');
const util = require('util');

const dataHandlers = {};

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);

dataHandlers.baseDir = path.join(__dirname, '/../.data');

dataHandlers.create = async (dir, file, data) => {
    try {
        const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
        if(fs.existsSync(filePath)) {
            return Promise.reject('File Already Exists');
        }
        const stringData = JSON.stringify(data);
        
        await writeFile(filePath, stringData);
        return Promise.resolve();
    }
    catch(err) {
        return Promise.reject(err);
    }
    
};

dataHandlers.read = async (dir, file) => {
    try {
        const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
        if(!fs.existsSync(filePath))
            return Promise.reject("File Doesn't Exists.");
        let data = await readFile(filePath, 'utf-8');
        data = JSON.parse(data);
        return Promise.resolve(false, data);
    }
    catch(err) {
        return Promise.reject('File Doesn\'t Exist');
    }
};

dataHandlers.update = async (dir, file, data) => {
    try {
        const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
        if(!fs.existsSync(filePath)) {
            return Promise.reject("The File Doesn't Exist");
        }
        const stringData = JSON.stringify(data);
        await writeFile(filePath, stringData);
        return Promise.resolve();
    }
    catch(err) {
        console.error(err);
        return Promise.resolve(err);
    }
    
};

dataHandlers.delete = async (dir, file) => {
    try {
        const filePath = `${dataHandlers.baseDir}/${dir}/${file}.json`;
        if(!fs.existsSync(filePath)) {
            return Promise.reject('The File doesn\'t Exist');
        }
        await unlink(filePath);
        return Promise.resolve(false);
    }
    catch(err) {
        console.error(err);
        return Promise.reject(err);
    }
};

dataHandlers.getFilesInDirectory = async (dir, callback) => {

    try {
        const dirPath = `${dataHandlers.baseDir}/${dir}`;
        let allUsers = [];
        let files = await readdir(dirPath);
        files.forEach(file => {
            allUsers.push(file.split('.')[0]);
        })
        return Promise.resolve(false, allUsers);
    }
    catch(err) {
        return Promise.reject(err, null);
    }
}

module.exports = dataHandlers;
