/**
 * Init jQuery
 */
const $ = require('jquery');
window.$ = window.jQuery = window.jquery = $;

/**
 * Init Semantic UI
 */
require('semantic-ui-css/semantic.min.js');

$('.ui.dropdown').dropdown()
$('.ui.checkbox').checkbox()
$('.menu .item').tab()

const { TreeView } = require('../utils/treeview')
const treeView = new TreeView('#list-files')

/**
 * Symmetric module
 */

const symmetric = require('../utils/symmetric/symmetric');
const algorithms = require('../utils/symmetric/algorithms')

const { dialog } = require('electron')

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

$('#btnEncrypt').click(() => {
    const algo = $('#dropdown-algo').find('.item.selected').attr('data-algo');
    console.log(algo);
    if (!algo || algo == '') {
        return showAlert('Error', 'Algorithm is required')
    }
    
    const password = $('#inp-enc-pass').val();
    console.log(password);
    if (!password || password == '' || password.length < 5) {
        return showAlert('Error', 'Passphrase is at least 5 characters')
    }
    
    const files = treeView.files;
    console.log(files);
    if (files.length == 0) {
        return showAlert('Error', 'Please select at least one file')
    }

    files.forEach(file => {
        const outputPath = file.path + '.enc'
        const keyFilePath = file.path + '.key'
        symmetric.encrypt(file.path, password, algorithms[algo], outputPath, keyFilePath).then(() => {
            showAlert('Success', 'File is encrypted');
        }).catch(err => {
            console.log(err);
        })
    })
})

function showAlert(title = 'Alert', message = '') {
    $('#alert-title').text(title);
    $('#alert-message').text(message);
    $('#modal-alert').modal('show')
}

function showConfirm(title = 'Confirm', message = '', onOK = () => {}) {
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