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

