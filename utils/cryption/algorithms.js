const symmetric = {
    'aes-256-cbc': {
        name: 'aes-256-cbc',
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
    'aes-128-cbc': {
        name: 'aes-128-cbc',
        keyLength: 128,
        blockSize: 128,
        ivSize: 128,
    },
    'des-cbc': {
        name: 'des-cbc',
        keyLength: 64,
        blockSize: 64,
        ivSize: 64,
    },
    'des-ede3-cbc': {
        name: 'des-ede3-cbc',
        keyLength: 192,
        blockSize: 64,
        ivSize: 64,
    },
}

const asymmetric = {
    'rsa': {
        name: 'rsa',
        type: 'asymmetric',
    },
}

module.exports = {
    symmetric,
    asymmetric,
};