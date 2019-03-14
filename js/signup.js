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


$('#btn-back').click(() => {
    window.history.back()
})

$('#btn-signup').click(() => {
    console.log('start sign up');
})