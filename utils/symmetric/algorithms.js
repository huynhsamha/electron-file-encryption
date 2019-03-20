const algorithms = {
    'aes-256-cbc': {
        name: 'aes-256-cbc',
        type: 'symmetric',
        keyLength: 256,
        blockSize: 128,
        ivSize: 128,
    },
    'aes-192-cbc': {
        name: 'aes-192-cbc',
        keyLength: 192,
        blockSize: 128,
        ivSize: 128,
    },
    'rsa': {
        name: 'rsa',
        type: 'asymmetric',
        keyLength: 256,
    }
}



module.exports = algorithms;