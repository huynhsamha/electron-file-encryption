const crypto = require('crypto');
const fs = require('fs');
const { AppendConfigWriter, readConfig, createEncryptedReadStream } = require('./header-handle');
const path = require('path');
const algorithms = require('./algorithms');
const symmKeyHandle = require('./sym-key-handle');
const ByteCounterStream = require('./byte-counter-stream');

/**
 * 
 * @param {string} filePath - Path to the file to be encrypted.
 * @param {string} password - The password used to lock the file.
 * @param {object} algorithm - The encryption algorithm, resides in `algorithms.js`.
 * @param {string} outputPath - The encrypted file path
 * @param {string} keyFilePath - The file path to store the key, in hex form.
 * @returns {Promise} - A Promise resolve when the encryption is done.
 */
function encrypt(filePath, password, algorithm, outputPath, keyFilePath, updateProgress) {
    // Key generating & config
    const { key, salt } = symmKeyHandle.genKey(password, algorithm.keyLength, algorithm.blockSize);
    const initVector = crypto.randomBytes(algorithm.ivSize / 8);
    const config = {
        algorithm: algorithm.name,
        salt,
        iv: initVector,
    }
    
    symmKeyHandle.writeKeyToFile(key, keyFilePath)

    // Encrypt & write to file
    const readStream = fs.createReadStream(filePath);
    const byteCounterStream = new ByteCounterStream(updateProgress);
    const cipher = crypto.createCipheriv(algorithm.name, key, config.iv);
    const appendConfigWriter = new AppendConfigWriter(config)
    const writeStream = fs.createWriteStream(path.join(outputPath));
    readStream
        .pipe(cipher)
        .pipe(byteCounterStream)
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
function decrypt(filePath, password, keyFilePath, outputPath, updateProgress) {
    const config = readConfig(filePath);
    const algorithm = algorithms.symmetric[config.algorithm];
    const key = typeof(keyFilePath) === 'string' ?
                symmKeyHandle.readKeyFromFile(keyFilePath)
                :
                symmKeyHandle.recoverKey(password, algorithm.keyLength, config.salt);
    
    const readStream = createEncryptedReadStream(filePath);
    const byteCounterStream = new ByteCounterStream(updateProgress);
    const decipher = crypto.createDecipheriv(algorithm.name, key, config.iv);
    const writeStream = fs.createWriteStream(outputPath);
    readStream
        .pipe(byteCounterStream)
        .pipe(decipher)
        .pipe(writeStream);
    
    return new Promise((resolve, reject) => {   
        decipher.on('error', () => reject('incorrect password'));
        writeStream.on('finish', () => resolve());
    });
        
}

module.exports = {
    encrypt,
    decrypt,
}