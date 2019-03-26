const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');
const hashModule = require('./hash');
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
    const config = {
        algorithm: 'rsa',
        salt,
        iv: crypto.randomBytes(algorithm.ivSize / 8),
        hash: hashModule.getHashValue(filePath),
    }
    
    // Encrypt private key
    const cipher = crypto.createCipheriv(algorithm.name, symKey, config.iv);
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
        outputStream.on('close', () => resolve());
    })
}

function decrypt(filePath, password, keyFilePath, outputPath) {
    return new Promise((resolve, reject) => {
        // Read RSA private key
        const rsaKey = new NodeRSA();
        const config = readConfig(filePath);

        // Using key file to get private key
        if (typeof(keyFilePath) === 'string') {
            const rsaKeyData = fs.readFileSync(keyFilePath);
            try {
                rsaKey.importKey(rsaKeyData, 'pkcs8-private-pem');
            }
            catch (e) {
                console.log(e);
                return reject('not a private key file');
            }
            
        }
        // Using password to decrypt encrypted private key
        else {
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
                return reject('incorrect password');
            }
        }
    
        // Decrypt data
        const inputStream = createEncryptedReadStream(filePath);
        data = Buffer.alloc(0);
        inputStream.on('data', chunk => {
            data = Buffer.concat([data, chunk]);
        });
        inputStream.on('end', () => {
            try {
                const plaintext = rsaKey.decrypt(data);
                fs.writeFileSync(outputPath, plaintext);
                const newHash = hashModule.getHashValue(outputPath);
                if (hashModule.validateHash(config.hash, newHash)) {
                    resolve();
                }
                else {
                    reject('incorrect hash, file corrupted');
                }
            }
            catch (e) {
                return reject('incorrect private key');
            }
        });

    });
}

module.exports = {
    encrypt,
    decrypt,
}

