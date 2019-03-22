const symmetric = require('./symmetric');
const algorithms = require('./algorithms')



file = 'test2.txt';
encryptFile = file + '.enc';
decryptFile = file + '.dec';
keyFile = file + '.key';
const password = 'this is the password?';

// Encrypt
function testEncrypt() {
    symmetric.encrypt(file, password, algorithms['aes-256-cbc'], encryptFile, keyFile)
    .then(() => {
        console.log('File encrypted!');
    });
}

function testDecriptUsePassword() {
    symmetric.decrypt(encryptFile, password, null, decryptFile)
        .then(() => {
            console.log('File decrypted!');
        });

}

function testDecryptUseKeyFile() {
    symmetric.decrypt(encryptFile, null, keyFile, decryptFile)
        .then(() => {
            console.log('File decrypted!');
        });
}

// testEncrypt();
testDecryptUseKeyFile()