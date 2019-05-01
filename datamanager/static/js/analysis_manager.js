$(document).ready(function () {
    let linearRegrTab = $('#linear_regr_tab');
    let polyRegrTab = $('#poly_regr_scatter_tab');
    let polyRegrInfoTab = $('#poly_regr_info_tab');
    let neuralRegrTab = $('#neural_regr_tab');
    let forestTab = $('#forest_tab');

    linearRegrTab.click(function () {
        handleEnterRegressionTab();
    });

    polyRegrTab.click(function () {
        handleEnterPolyTab();
    });

    polyRegrInfoTab.click(function () {
        handleEnterPolyInfoTab();
    });

    neuralRegrTab.click(function () {
        handleEnterNeuralTab();
    });

    forestTab.click(function () {
        handleEnterForestTab();
    });
});