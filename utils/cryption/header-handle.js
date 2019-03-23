const { Transform } = require('stream');
const fs = require('fs');
const serial = require('./serialize');

const HEADER_LENGTH = 2000;  // bytes

class AppendConfigWriter extends Transform {
    constructor(config, opts) {
        super(opts);
        this.appended = false;
        this.configString = serial.configSerialize(config).padEnd(HEADER_LENGTH, ' ');
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
    const file = fs.openSync(encryptedFilePath, 'r');
    const buffer = Buffer.alloc(HEADER_LENGTH, 0);
    fs.readSync(file, buffer, 0, HEADER_LENGTH, 0);
    return serial.configDeserialize(buffer.toString('utf8'));
}

function createEncryptedReadStream(encryptedFilePath) {
    return fs.createReadStream(encryptedFilePath, { start: HEADER_LENGTH });
}

module.exports = {
    AppendConfigWriter,
    readConfig,
    createEncryptedReadStream,
};
