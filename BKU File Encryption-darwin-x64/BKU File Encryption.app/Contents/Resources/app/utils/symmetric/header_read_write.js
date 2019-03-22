const { Transform } = require('stream');
const fs = require('fs');

const HEADER_LENGTH = 1300;  // bytes

class AppendConfigWriter extends Transform {
    constructor(config, opts) {
        super(opts);
        this.appended = false;
        const newConfig = this.changeBufferToString(config);
        this.configString = JSON.stringify(newConfig).padEnd(HEADER_LENGTH, ' ');
    }

    changeBufferToString(config) {
        const newConfig = {...config};
        for (let key in newConfig) {
            if (newConfig[key] instanceof Buffer) {
                newConfig[key] = newConfig[key].toString('hex');
            }
        }
        return newConfig;
    }

    _transform(chunk, encoding, callback) {
        if (!this.appended) {
            this.push(this.configString);
            this.appended = true;
        }
        this.push(chunk);
        callback();
    }
}

function readConfig(encryptedFilePath) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(encryptedFilePath, { end: HEADER_LENGTH - 1});

        let configString = '';
        readStream.on('data', (chunk) => {
            configString = chunk.toString('utf8');
        });

        readStream.on('end', () => {
            const configJson = JSON.parse(configString);
            resolve(configJson);
        });
    });
}

function createEncryptedReadStream(encryptedFilePath) {
    return fs.createReadStream(encryptedFilePath, { start: HEADER_LENGTH });
}

module.exports = {
    AppendConfigWriter,
    readConfig,
    createEncryptedReadStream,
};
