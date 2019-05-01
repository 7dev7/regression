$(document).ready(function () {
    let linearRegrTab = $('#linear_regr_tab');
    let polyRegrTab = $('#poly_regr_scatter_tab');
    let polyRegrInfoTab = $('#poly_regr_info_tab');
    let neuralRegrScatterTab = $('#neural_regr_scatter_tab');
    let neuralRegrInfoTab = $('#neural_regr_info_tab');
    let forestScatterTab = $('#forest_regr_scatter_tab');
    let forestInfoTab = $('#forest_regr_info_tab');

    linearRegrTab.click(function () {
        handleEnterRegressionTab();
    });

    polyRegrTab.click(function () {
        handleEnterPolyTab();
    });

    polyRegrInfoTab.click(function () {
        handleEnterPolyInfoTab();
    });

    neuralRegrScatterTab.click(function () {
        handleEnterNeuralScatterTab();
    });

    neuralRegrInfoTab.click(function () {
        handleEnterNeuralInfoTab();
    });

    forestScatterTab.click(function () {
        handleEnterForestScatterTab();
    });

    forestInfoTab.click(function () {
        handleEnterForestInfoTab();
    });
});