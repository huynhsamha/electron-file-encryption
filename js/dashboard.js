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

function showLoading(){
    $('#app-loading').dimmer('show')
}

function hideLoading(){
    $('#app-loading').dimmer('hide')
}