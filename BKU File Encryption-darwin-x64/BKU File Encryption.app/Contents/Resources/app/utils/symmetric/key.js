const crypto = require('crypto');
const fs = require('fs');

const ITERATIONS = 5000;
const DIGEST_FUNCTION = 'sha256';

function genKey(password, keyLength, saltLength) {
    const keyLengthInBytes = keyLength / 8;
    const salt = crypto.randomBytes(saltLength / 8);
    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, keyLengthInBytes, DIGEST_FUNCTION);
    return {
        key,    // a buffer
        salt,   // a buffer
    };
}

function recoverKey(password, keyLength, salt) {
    const keyLengthInBytes = keyLength / 8;
    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, keyLengthInBytes, DIGEST_FUNCTION);
    return key;
}

/**
 * 
 * @param {Buffer} key - The key to store.
 * @param {string} keyFilePath - Path to the file to store key.
 */
function writeKeyToFile(key, keyFilePath) {
    fs.writeFileSync(keyFilePath, key.toString('hex'))
}

/**
 * 
 * @param {string} keyFilePath - Path to the key file.
 * @param {Buffer} - The key
 */
function readKeyFromFile(keyFilePath) {
    let key = fs.readFileSync(keyFilePath, { encoding: 'utf8' });
    return Buffer.from(key, 'hex');
}

module.exports = {
    genKey,
    recoverKey,
    writeKeyToFile,
    readKeyFromFile,
}