const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');
const symKeyHandle = require('./sym-key-handle');
const algorithms = require('./algorithms');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const { Readable } = require('stream');
const {
    AppendConfigWriter,
    readConfig,
    createEncryptedReadStream,
} = require('./header-handle');


async function encrypt(filePath, password, outputPath, keyFilePath) {
    // Create new RSA key pair
    const rsaKey = new NodeRSA({ b: 1024 });
    
    // Write private key (in plaintext) to file
    fs.writeFile(keyFilePath, rsaKey.exportKey('pkcs8-private-pem'), () => {});
    
    //// Encrypt key data using symmetric encryption
    // Get symmetric key from password
    const algorithm = algorithms.symmetric["aes-256-cbc"];
    const { key: symKey, salt } = symKeyHandle.genKey(password, algorithm.keyLength, algorithm.blockSize);
    const initVector = crypto.randomBytes(algorithm.ivSize / 8);
    const config = {
        algorithm: 'rsa',
        salt,
        iv: initVector,
    }
    
    // Encrypt private key
    const cipher = crypto.createCipheriv(algorithm.name, symKey, initVector);
    const encryptedPrivateKey = Buffer.concat([
        cipher.update(rsaKey.exportKey('pkcs8-private-der')),
        cipher.final()
    ]);
    config['encryptedPrivateKey'] = encryptedPrivateKey;

    // Encrypt data
    const fileData = await readFile(filePath);
    const encryptedFileData = rsaKey.encrypt(fileData);
    const inputStream = new Readable();
    inputStream.push(encryptedFileData);
    inputStream.push(null);

    const appendConfigWriter = new AppendConfigWriter(config);
    const outputStream = fs.createWriteStream(outputPath);
    inputStream
        .pipe(appendConfigWriter)
        .pipe(outputStream);
    
    return new Promise((resolve, reject) => {
        outputStream.on('finish', () => resolve());
    })
}

function decrypt(filePath, password, keyFilePath, outputPath) {
    // Read RSA private key
    const rsaKey = new NodeRSA();
    let incorrectPassword = false;

    // Using key file to get private key
    if (typeof(keyFilePath) === 'string') {
        const rsaKeyData = fs.readFileSync(keyFilePath);
        rsaKey.importKey(rsaKeyData, 'pkcs8-private-pem');
    }
    // Using password to decrypt encrypted private key
    else {
        const config = readConfig(filePath);
        const symAlg = algorithms.symmetric['aes-256-cbc'];
        const symKey = symKeyHandle.recoverKey(password, symAlg.keyLength, config.salt);

        const decipher = crypto.createDecipheriv(symAlg.name, symKey, config.iv);
        try {
            const rsaKeyData = Buffer.concat([
                decipher.update(config.encryptedPrivateKey),
                decipher.final()
            ]);
            rsaKey.importKey(rsaKeyData, 'pkcs8-private-der');
        }
        catch (e) {
            incorrectPassword = true;
        }
    }
    
    return new Promise((resolve, reject) => {
        if (incorrectPassword) {
            reject('incorrect password');
        }
        else {
            // Decrypt data
            const inputStream = createEncryptedReadStream(filePath);
            inputStream.on('data', encryptedData => {
                const plaintext = rsaKey.decrypt(encryptedData);
                fs.writeFileSync(outputPath, plaintext);
                resolve();
            });
        }

    });
}

module.exports = {
    encrypt,
    decrypt,
}

