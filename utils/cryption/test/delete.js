const cryption = require('../index');

var file = 'setup.exe';


var file = '/dev/shm/ramdisk/' + file;
var enc = file + '.enc';
var key = file + '.key';
var dec = enc + '.dec';

// var alg = 'aes-256-cbc';
var alg = 'rsa'
function testEncryption() {
    cryption.encrypt(alg, file, 'my password', enc, key)
        .then(() => {
            console.log('File encrypted!');
        })
        .catch(err => {
            console.log(err);
        })
}

function testDecryption() {
    cryption.decrypt(enc, 'my password', null, dec)
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            if (err === 'incorrect password')
                console.log('Error: Incorrect Password! Check your password!')
        })
}

function testDecryptionWrongPassword() {
    cryption.decrypt(enc, 'my incorrect password', null, dec)
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            // if (err === 'incorrect password')
            //     console.log('Error: Incorrect Password! Check your password!')
            console.log(err)
        })
}

function testDecryptionUseKeyFile() {
    cryption.decrypt(enc, null, key, dec)
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            console.log(err)
        })
}

// testEncryption();
// testDecryption();
// testDecryptionWrongPassword();
testDecryptionUseKeyFile();