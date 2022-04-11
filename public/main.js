//@ts-check
'use strict';

window.onload = function () {

    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');

    /** @ts-ignore @type {HTMLSelectElement} */
    let sampleDropdown = document.getElementById('sample');
    /** @ts-ignore @type {HTMLInputElement} */
    let equationInput = document.getElementById('equation');
    /** @ts-ignore @type {HTMLInputElement} */
    let equationMsg = document.getElementById('equation-message');
    /** @ts-ignore @type {HTMLInputElement} */
    let submitButton = document.getElementById('submit');

    if (equationInput.value == '') equationInput.value = '( sqrt ( x ^ 2 + y ^ 2 ) - 1.25 ) ^ 2 + z ^ 2 - 0.5 = 0';

    let equation = Expression.fromStrings(equationInput.value.replace(/\=/g, '>')).substConstants();
    let plotArea = new PlotArea(canvas);
    plotArea.setEquation(equation);


    sampleDropdown.onchange = function () {
        let selected = sampleDropdown.options[sampleDropdown.selectedIndex];
        if (selected.value == 'x') return;

        let choice = selected.innerHTML;
        equationInput.value = choice;

        submit();
    }

    equationInput.onchange = function () {
        sampleDropdown.selectedIndex = 0;
    }

    equationInput.onkeydown = function (event) {
        if (event.key != 'Enter') return;
        submit();
    }

    submitButton.onclick = function () {
        submit();
    }

    let submit = () => {
        equationMsg.innerHTML = '';

        let inputEquation = Expression.fromStrings(equationInput.value);
        equationInput.value = inputEquation.toStrings();

        let chkValid = inputEquation.substConstants().substVariables(1, 1, 1).solve().toStrings();
        if (chkValid != 'true' && chkValid != 'false') {
            equationMsg.innerHTML = 'Invalid Equation';
        }

        let equation = Expression.fromStrings(equationInput.value.replace(/\=/g, '>')).substConstants();
        plotArea.setEquation(equation);
    }
}
