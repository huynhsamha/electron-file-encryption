const cryption = require('../index');

console.log('Supported symmetric cryption algorithms;')
console.log(cryption.symmAlgs);

console.log('Supported asymmetric cryption algorithms;')
console.log(cryption.asymmAlgs);

console.log();


function testGetSampleKeys() {
    console.log(cryption.getDemoSymmetricKey(cryption.symmAlgs[0], 'hello world'));
    console.log(cryption.getDemoRSAKey());

}



// var alg = cryption.asymmAlgs[0]; // 'rsa'
var alg = cryption.symmAlgs[5];


function testEncryption() {
    cryption.encrypt(alg, 'test.txt', 'my password', 'test.txt.enc', 'test.txt.key')
        .then(() => {
            console.log('File encrypted!');
        })
        .catch(err => {
            console.log(err);
        })
}

function testDecryption() {
    cryption.decrypt('test.txt.enc', 'my password', null, 'test.txt.enc.dec')
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            if (err === 'incorrect password')
                console.log('Error: Incorrect Password! Check your password!')
        })
}

function testDecryptionWrongPassword() {
    cryption.decrypt('test.txt.enc', 'my incorrect password', null, 'test.txt.enc.dec')
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            if (err === 'incorrect password')
                console.log('Error: Incorrect Password! Check your password!')
        })
}

function testDecryptionUseKeyFile() {
    cryption.decrypt('test.txt.enc', null, 'test.txt.key', 'test.txt.enc.dec')
        .then(() => {
            console.log('File decrypted!');
        })
        .catch(err => {
            console.log('Error: A problem occured. Maybe your key file is corrupted.')
            console.log('Error: This error cannot be handled! Use your password instead, or say goodbye to your file :))')
        })
}

function testEncryptAndDecrypt(alg) {
    console.log('Encryption algorithm:', alg);
    cryption.encrypt(alg, 'test.txt', 'my password', 'test.txt.enc', 'test.txt.key')
        .then(() => {
            console.log('File encrypted!');
            cryption.decrypt('test.txt.enc', 'my password', null, 'test.txt.enc.dec')
                .then(() => {
                    console.log('File decrypted using password!');
                    cryption.decrypt('test.txt.enc', null, 'test.txt.key', 'test.txt.enc.dec')
                        .then(() => {
                            console.log('File decrypted using key file!');
                        })
                })
        })
        .catch(err => {
            console.log(err);
        })
}

testGetSampleKeys();

// testEncryption();
// testDecryption();
// testDecryptionWrongPassword();
// testDecryptionUseKeyFile();


// testEncryptAndDecrypt(cryption.asymmAlgs[0]);
// testEncryptAndDecrypt(cryption.symmAlgs[0]);
// testEncryptAndDecrypt(cryption.symmAlgs[1]);
// testEncryptAndDecrypt(cryption.symmAlgs[2]);
// testEncryptAndDecrypt(cryption.symmAlgs[3]);
// testEncryptAndDecrypt(cryption.symmAlgs[4]);