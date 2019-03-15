/**
 * Init jQuery
 */
const $ = require('jquery');
window.$ = window.jQuery = window.jquery = $;

/**
 * Init Semantic UI
 */
require('semantic-ui-css/semantic.min.js');



$('#btn-back').click(() => {
    window.history.back()
})

$('#btn-to-form-signup').click(() => {
    window.location.href = "../views/signup.html"
})

$('#btn-login').click(() => {
    showLoading();
    setTimeout(() => {
        hideLoading();
        window.location.href = "../views/dashboard.html"
    }, 800);
})

function showLoading(){
    $('#app-loading').dimmer('show')
}

function hideLoading(){
    $('#app-loading').dimmer('hide')
}