/**
 * Init jQuery
 */
const $ = require('jquery');
window.$ = window.jQuery = window.jquery = $;

/**
 * Init Semantic UI
 */
require('semantic-ui-css/semantic.min.js');


$('#btn-to-login').click(() => {
    window.location.href = '../views/login.html'
})

$('#btn-to-signup').click(() => {
    window.location.href = '../views/signup.html'
})

$('#btn-start').click(() => {
})