$(document).ready(function () {

    const thresholdInput = $('#thresholdInput');
    const highlightLimit = $('#highlightLimit');
    const pValueInput = $('#pValueInput');
    const nnMinHiddenValInput = $('#nnMinHiddenValInput');
    const nnMaxHiddenValInput = $('#nnMaxHiddenValInput');
    const polyMinDegreeInput = $('#polyMinDegreeInput');
    const polyMaxDegreeInput = $('#polyMaxDegreeInput');

    thresholdInput.change(function () {
        if (!validateInt(thresholdInput.val())) {
            thresholdInput.addClass('is-invalid');
        } else {
            thresholdInput.removeClass('is-invalid');
        }
    });

    highlightLimit.change(function () {
        if (!validateInt(highlightLimit.val())) {
            highlightLimit.addClass('is-invalid');
        } else {
            highlightLimit.removeClass('is-invalid');
        }
    });

    nnMinHiddenValInput.change(function () {
        if (!validateInt(nnMinHiddenValInput.val())) {
            nnMinHiddenValInput.addClass('is-invalid');
        } else {
            nnMinHiddenValInput.removeClass('is-invalid');
        }
    });

    nnMaxHiddenValInput.change(function () {
        if (!validateInt(nnMaxHiddenValInput.val())) {
            nnMaxHiddenValInput.addClass('is-invalid');
        } else {
            nnMaxHiddenValInput.removeClass('is-invalid');
        }
    });

    polyMinDegreeInput.change(function () {
        if (!validateInt(polyMinDegreeInput.val())) {
            polyMinDegreeInput.addClass('is-invalid');
        } else {
            polyMinDegreeInput.removeClass('is-invalid');
        }
    });

    polyMaxDegreeInput.change(function () {
        if (!validateInt(polyMaxDegreeInput.val())) {
            polyMaxDegreeInput.addClass('is-invalid');
        } else {
            polyMaxDegreeInput.removeClass('is-invalid');
        }
    });

    $('#saveSettingsBtn').click(function () {
        const nnMinValue = validateInt(nnMinHiddenValInput.val());
        const nnMaxValue = validateInt(nnMaxHiddenValInput.val());

        const polyMinValue = validateInt(polyMinDegreeInput.val());
        const polyMaxValue = validateInt(polyMaxDegreeInput.val());

        if (nnMinValue > nnMaxValue) {
            nnMinHiddenValInput.toggleClass('is-invalid');
            return false;
        }

        if (polyMinValue > polyMaxValue) {
            polyMinDegreeInput.toggleClass('is-invalid');
            return false;
        }
    });
});

function validateInt(rawVal) {
    return parseInt(rawVal);
}