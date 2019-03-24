const crypto = require('crypto');
const fs = require('fs');

function getHashValue(filePath) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    return hash.digest('hex');
}

function validateHash(oldHash, newHash) {
    return oldHash === newHash;
}


module.exports = {
    getHashValue,
    validateHash,
};
