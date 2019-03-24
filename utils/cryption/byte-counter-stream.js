const { Transform } = require('stream');

class ByteCounterStream extends Transform {
    constructor(callback, opts) {
        super(opts);
        this.byteCount = 0;
        if (typeof(callback) !== 'function')
            callback = () => {};
        this.update = async () => callback(this.byteCount);
    }

    _transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();

        this.byteCount += chunk.length;
        this.update();
    }
}

module.exports = ByteCounterStream;