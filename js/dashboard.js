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

$('#modal-logout').modal({
    onApprove: logout
})

$('#btn-logout').click(() => {
    $('#modal-logout').modal('show')
})

function logout() {
    $('#modal-logout').modal('hide')
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