$(document).ready(function () {
    let step1 = $('#step1');
    let step2 = $('#step2');

    $('#step1_button').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });

    $('#step1_next').click(function () {
        step1.hide('fast');
        step2.show('fast');
    });

    $('#step2_back').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });
});