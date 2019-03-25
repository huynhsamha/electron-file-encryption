/**
 * Node Modules
 */
const path = require('path');
const async = require('async');

/**
 * Init jQuery
 */
const $ = require('jquery');
window.$ = window.jQuery = window.jquery = $;

const faqs = require('../db/faq.json');

/**
 * Init Semantic UI
 */
require('semantic-ui-css/semantic.min.js');

$('.ui.dropdown').dropdown()
$('.ui.checkbox').checkbox()
$('.menu .item').tab()


/**
 * Tree View Module
 */
const { TreeView } = require('../utils/treeview')
const treeView = new TreeView('#list-files')

/**
 * Cryption module
 */
const cryption = require('../utils/cryption');


const username = localStorage.getItem('USERNAME');
if (username && username != '') {
    $('#username').text(username);
}

const $progressBar = $('#progressBar');
$progressBar.hide();

$progressBar.progress({
    text: {
        active: '{percent}% done',
        success: 'Successfully',
    }
})

$('#btn-logout').click(() => {
    showConfirm('Warning', 'Do you want to logout?', logout);
})

$('#raw-file').on('change', function () {
    const files = this.files;
    console.log(files);
    /*
    FileList {0: File(1821), length: 1}
    0: File(1821)
        lastModified: 1552612464124
        lastModifiedDate: Fri Mar 15 2019 08:14:24 GMT+0700 (Indochina Time) {}
        name: "main.js"
        path: "/home/huynhha/Documents/github/electron-file-encryption/main.js"
        size: 1821
        type: "text/javascript"
    length: 1
    */
    const isFolder = $('#raw-file').attr('directory') != null;
    if (isFolder) {
        treeView.addFolder(files[0])
    } else {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            treeView.addFile(file)
        }
    }
    $('#raw-file').val('')
})

$('#out-dir').on('change', function () {
    const files = this.files;
    console.log(files);
    $('#out-dir-path').val(files[0].path)
})

$('#out-dir-decrypt').on('change', function () {
    const files = this.files;
    console.log(files);
    $('#out-dir-decrypt-path').val(files[0].path)
})

$('#encrypted-file').on('change', function () {
    const files = this.files;
    console.log(files);
    $('#encrypted-file-path').val(files[0].path)
})

$('#key-file').on('change', function () {
    const files = this.files;
    console.log(files);
    $('#key-file-path').val(files[0].path)
})

$('#select-raw-file').on('change', function () {
    const { value } = this
    const $rawFile = $('#raw-file')

    $rawFile.removeAttr('multiple directory webkitdirectory mozdirectory');
    if (value == 'folder') {
        $rawFile.attr({ directory: true, webkitdirectory: true, mozdirectory: true })
    } else if (value == 'multiple') {
        $rawFile.attr('multiple', true);
    }
})

const $btnVisible = $('#btn-visible');
const $inputEncryptPass = $('#inp-enc-pass');
$btnVisible.click(() => {
    const $ic = $btnVisible.find('i');
    if ($ic.hasClass('slash')) {
        $ic.removeClass('slash')
        $inputEncryptPass.attr('type', 'password');
    } else {
        $ic.addClass('slash')
        $inputEncryptPass.attr('type', 'input');
    }
})

const $btnVisibleDecrypt = $('#btn-visible-decrypt');
const $inputDecryptPass = $('#inp-decrypt-pass');
$btnVisibleDecrypt.click(() => {
    const $ic = $btnVisibleDecrypt.find('i');
    if ($ic.hasClass('slash')) {
        $ic.removeClass('slash')
        $inputDecryptPass.attr('type', 'password');
    } else {
        $ic.addClass('slash')
        $inputDecryptPass.attr('type', 'input');
    }
})

$('#btnEncrypt').click(() => {
    $('#btnEncrypt').attr('disabled', true);

    const enableButton = () => $('#btnEncrypt').attr('disabled', false);

    const algo = $('#dropdown-algo').find('.item.selected').attr('data-algo');
    console.log(algo);
    if (!algo || algo == '') {
        enableButton()
        return showAlert('Error', 'Algorithm is required')
    }

    const password = $('#inp-enc-pass').val();
    console.log(password);
    if (!password || password == '' || password.length < 5) {
        enableButton()
        return showAlert('Error', 'Passphrase is at least 5 characters')
    }

    const files = treeView.files;
    console.log(files);
    if (files.length == 0) {
        enableButton()
        return showAlert('Error', 'Please select at least one file')
    }

    const outputFilePath = $('#out-dir-path').val();
    if (!outputFilePath || outputFilePath == '') {
        enableButton()
        return showAlert('Error', 'Please select a output directory')
    }

    // $progressBar.show();
    // $progressBar.progress('reset');
    // window.complete = false;
    // clearInterval(window.fakeProgress)

    // window.fakeProgress = setInterval(() => {
    //     const currentPercent = $progressBar.progress('get percent');
    //     if (window.complete) {
    //         $progressBar.progress('set percent(100)')
    //     } else {
    //         if (currentPercent)
    //         $progress.progress('increment(1)');
    //     }
    // }, 100);

    if (algo == 'rsa') showLoading();

    async.eachSeries(files, (file, cb) => {
        const outputDir = $('#out-dir-path').val();
        const outputPath = path.join(outputDir, file.name + '.enc')
        const keyFilePath = path.join(outputDir, file.name + '.key')
        cryption.encrypt(algo, file.path, password, outputPath, keyFilePath).then(() => {
            console.log('Success', outputPath);
            cb();
        }).catch(err => cb(err))
    }, err => {
        hideLoading();
        enableButton();
        if (err) {
            console.log(err);
        } else {
            showAlert('Success', 'File is encrypted successfully');
        }
    })
})

$('#btn-decrypt-pass').click(() => {
    $('#btn-decrypt-pass').attr('disabled', true);

    const enableButton = () => $('#btn-decrypt-pass').attr('disabled', false);

    const encryptedFilePath = $('#encrypted-file-path').val();
    if (!encryptedFilePath || encryptedFilePath == '') {
        enableButton();
        return showAlert('Error', 'Please select a encrypted file')
    }

    const outputDirPath = $('#out-dir-decrypt-path').val();
    if (!outputDirPath || outputDirPath == '') {
        enableButton();
        return showAlert('Error', 'Please select a output directory')
    }

    const password = $('#inp-decrypt-pass').val();
    if (!password || password == '' || password.length < 5) {
        enableButton();
        return showAlert('Error', 'Passphrase is at least 5 characters')
    }

    console.log(encryptedFilePath);
    console.log(outputDirPath);
    console.log(password);

    const outputFilePath = path.join(outputDirPath, `decrypted-file-${Date.now() / 1000}.dec`);

    window.shouldBeRSA = true;
    setTimeout(() => {
        if (window.shouldBeRSA) {
            showLoading();
        }
    }, 800);

    cryption.decrypt(encryptedFilePath, password, null, outputFilePath).then(() => {
        window.shouldBeRSA = false;
        hideLoading();
        enableButton();
        showAlert('Success', `File is decrypted successfully. Your file: ${outputFilePath}`);
    }).catch(err => {
        console.log(err);
        window.shouldBeRSA = false;
        hideLoading();
        enableButton();
        showAlert('Error', 'Passphrase is not correct');
    })
})

$('#btn-decrypt-key-file').click(() => {
    $('#btn-decrypt-key-file').attr('disabled', true);

    const enableButton = () => $('#btn-decrypt-key-file').attr('disabled', false);

    const encryptedFilePath = $('#encrypted-file-path').val();
    if (!encryptedFilePath || encryptedFilePath == '') {
        enableButton()
        return showAlert('Error', 'Please select a encrypted file')
    }

    const outputDirPath = $('#out-dir-decrypt-path').val();
    if (!outputDirPath || outputDirPath == '') {
        enableButton()
        return showAlert('Error', 'Please select a output directory')
    }

    const keyFilePath = $('#key-file-path').val();
    if (!keyFilePath || keyFilePath == '') {
        enableButton()
        return showAlert('Error', 'Please select a key file')
    }

    console.log(encryptedFilePath);
    console.log(outputDirPath);
    console.log(keyFilePath);

    const outputFilePath = path.join(outputDirPath, `decrypted-file-${Date.now() / 1000}.dec`);

    window.shouldBeRSA = true;
    setTimeout(() => {
        if (window.shouldBeRSA) {
            showLoading();
        }
    }, 800);

    cryption.decrypt(encryptedFilePath, null, keyFilePath, outputFilePath).then(() => {
        window.shouldBeRSA = false;
        hideLoading();
        enableButton();
        showAlert('Success', `File is decrypted successfully. Your file: ${outputFilePath}`);
    }).catch(err => {
        console.log(err);
        window.shouldBeRSA = false;
        hideLoading();
        enableButton();
        showAlert('Error', 'Key file is invalid');
    })
})

$('#btnViewKey').click(() => {
    const algo = $('#dropdown-algo').find('.item.selected').attr('data-algo');
    console.log(algo);
    if (!algo || algo == '') {
        return showAlert('Error', 'Algorithm is required')
    }

    if (algo == 'rsa') {
        return showAlert('Error', 'RSA Keys will be generated in enryption time')
    }

    const password = $('#inp-enc-pass').val();
    console.log(password);
    if (!password || password == '' || password.length < 5) {
        return showAlert('Error', 'Passphrase is at least 5 characters')
    }

    showAlert('Encryption Key', cryption.getDemoSymmetricKey(algo, password))
})

$('#btnRemoveAllFiles').click(() => {
    if (treeView.files.length == 0) {
        return showAlert('Notification', 'No any files selected. Please choose some files to encrypt');
    }
    showConfirm('Warning', 'Are you sure to remove all files selected?', () => {
        treeView.removeAll();
    });
})

function renderSingleFAQ({Q, A}) {
    return `
    <div class="title">
        <i class="dropdown icon"></i> ${Q}
    </div>
    <div class="content">
        <p class="transition hidden">${A}</p>
    </div>`
}

initFAQ();

function initFAQ() {
    const faqHTML = faqs.map(u => renderSingleFAQ(u)).join('\n');
    $('#list-faq').html($(faqHTML));
    $('#list-faq').accordion();
}

function showAlert(title = 'Alert', message = '') {
    $('#alert-title').text(title);
    $('#alert-message').text(message);
    $('#modal-alert').modal('show')
}

function showConfirm(title = 'Confirm', message = '', onOK = () => { }) {
    $('#confirm-title').text(title);
    $('#confirm-message').text(message);
    $('#modal-confirm').modal({
        onApprove: onOK
    })
    $('#modal-confirm').modal('show');
}

function logout() {
    $('#modal-confirm').modal('hide')
    setTimeout(() => {
        showLoading();
        localStorage.clear();
        setTimeout(() => {
            hideLoading();
            window.location.href = "../views/index.html"
        }, 800)
    })
}

function showLoading() {
    $('#app-loading').dimmer('show')
}

function hideLoading() {
    $('#app-loading').dimmer('hide')
}