const NodeRSA = require('node-rsa');
const symmKeyHandle = require('./sym-key-handle');
const algorithms = require('./algorithms');
const symmetric = require('./symmetric');
const asymmetric = require('./asymmetric');
const symmAlgs = Object.keys(algorithms.symmetric);
const asymmAlgs = Object.keys(algorithms.asymmetric);
const { readConfig } = require('./header-handle');

function getDemoSymmetricKey(symAlgName, password) {
    const alg = algorithms.symmetric[symAlgName];
    const { key } = symmKeyHandle.genKey(password, alg.keyLength, alg.blockSize);
    return key.toString('hex');
}

function getDemoRSAKey() {
    const rsaKey = new NodeRSA({ b: 1024 });
    return {
        publicKey: rsaKey.exportKey('pkcs8-public-pem'),
        privateKey: rsaKey.exportKey('pkcs8-private-pem'),
    }
}

/**
 * 
 * Callback function to check to cryption progress
 * Only effective when using with symmetric encryption/decryption
 * Discarded when used with asymmetric encryption/decryption
 * 
 * @callback updateProgressCallback
 * @param {number} byteCount - The number of bytes processed.
 */

/**
 * 
 * @param {string} algorithm - The algorithm used for encryption.
 * @param {string} filePath - Path to the file to be encrypted.
 * @param {string} password - The password used to lock the file.
 * @param {string} outputPath - The encrypted file path
 * @param {string} keyFilePath - The file path to store the key, in hex form.
 * @param {updateProgressCallback} updateProgress - A callback function to monitor encryption progress
 * 
 */
function encrypt(algorithm, filePath, password, outputPath, keyFilePath, updateProgress) {
    return new Promise((resolve, reject) => {
        let func = null;
        let args = null;
        if (symmAlgs.includes(algorithm)) {
            func = symmetric.encrypt;
            args = [filePath, password, algorithms.symmetric[algorithm], outputPath, keyFilePath, updateProgress];
        }
        else {
            func = asymmetric.encrypt;
            args = [filePath, password, outputPath, keyFilePath, updateProgress]
        }
        func.apply(null, args)
            .then(resolve)
            .catch(reject);
    });
    
}

/**
 * 
 * @param {string} filePath - Path to the file to be decrypted.
 * @param {string} password - The password used to lock the file.
 * @param {string} keyFilePath - The path to the key file. `password` or `keyFilePath` has to be specified.
 * @param {string} outputPath - The decrypted file path
 * @param {updateProgressCallback} updateProgress - A callback function to monitor decryption progress
 */
function decrypt(filePath, password, keyFilePath, outputPath, updateProgress) {
    return new Promise((resolve, reject) => {
        const config = readConfig(filePath);
        let decryptFunc = null;
        let args = null;
        if (symmAlgs.includes(config.algorithm)) {
            decryptFunc = symmetric.decrypt;
            args = [filePath, password, keyFilePath, outputPath, updateProgress];
        }
        else {
            decryptFunc = asymmetric.decrypt;
            args = [filePath, password, keyFilePath, outputPath];
        }
        decryptFunc.apply(null, args)
            .then(resolve)
            .catch(reject);
    });

}



module.exports = {
    symmAlgs,
    asymmAlgs,
    getDemoSymmetricKey,
    getDemoRSAKey,
    encrypt,
    decrypt,
}

