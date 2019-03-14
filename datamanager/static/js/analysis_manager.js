$(document).ready(function () {
    let linearRegrTab = $('#linear_regr_tab');
    let polyRegrTab = $('#poly_regr_tab');
    let neuralRegrTab = $('#neural_regr_tab');

    linearRegrTab.click(function () {
        handleEnterRegressionTab();
    });

    polyRegrTab.click(function () {
        handleEnterPolyTab();
    });

    neuralRegrTab.click(function () {
        handleEnterNeuralTab();
    });
});