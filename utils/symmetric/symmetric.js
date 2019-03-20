const crypto = require('crypto');
const fs = require('fs');
const { AppendConfigWriter, readConfig, createEncryptedReadStream } = require('./header_read_write');
const path = require('path');
const algorithms = require('./algorithms');
const keyModule = require('./key');

/**
 * 
 * @param {string} filePath - Path to the file to be encrypted.
 * @param {string} password - The password used to lock the file.
 * @param {object} algorithm - The encryption algorithms, resides in `algorithms.js`.
 * @param {string} outputPath - The encrypted file path
 * @param {string} keyFilePath - The file path to store the key, in hex form.
 * @returns {Promise} - A Promise resolve when the encryption is done.
 */
function encrypt(filePath, password, algorithm, outputPath, keyFilePath) {
    // Key generating & config
    const { key, salt } = keyModule.genKey(password, algorithm.keyLength, algorithm.blockSize);
    const initVector = crypto.randomBytes(algorithm.ivSize / 8);
    const config = {
        algorithm: algorithm.name,
        salt,
        iv: initVector,
    }
    

    
    keyModule.writeKeyToFile(key, keyFilePath)

    // Encrypt & write to file
    const readStream = fs.createReadStream(filePath);
    const cipher = crypto.createCipheriv(algorithm.name, key, config.iv);
    const appendConfigWriter = new AppendConfigWriter(config)
    const writeStream = fs.createWriteStream(path.join(outputPath));
    readStream
        .pipe(cipher)
        .pipe(appendConfigWriter)
        .pipe(writeStream)

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve());
    });
}

/**
 * 
 * @param {string} filePath - Path to the file to be decrypted.
 * @param {string} password - The password used to lock the file.
 * @param {string} keyFilePath - The path to the key file. `password` or `keyFilePath` has to be specified.
 * @param {string} outputPath - The decrypted file path
 * @returns {Promise} - A Promise resolve when the decryption is done.
 */
function decrypt(filePath, password, keyFilePath, outputPath) {
    return new Promise((resolve, reject) => {
        readConfig(filePath)
            .then((config) => {
                algorithm = algorithms[config.algorithm];
                let key = ''
                const salt = Buffer.from(config.salt, 'hex');
                if (typeof(password) === 'string') {
                    key = keyModule.recoverKey(password, algorithm.keyLength, salt);
                } else {
                    key = keyModule.readKeyFromFile(keyFilePath);
                }
                const readStream = createEncryptedReadStream(filePath);
                const initVector = Buffer.from(config.iv, 'hex');
                const decipher = crypto.createDecipheriv(algorithm.name, key, initVector);
                const writeStream = fs.createWriteStream(outputPath);
                readStream
                    .pipe(decipher)
                    .pipe(writeStream);
                writeStream.on('finish', () => resolve());
            });
    });
        
}

module.exports = {
    encrypt,
    decrypt,
}