//@ts-check
'use strict';

function compileEquation() {

    let input = '3+2*4=4^3';
    console.log(input);

    let tokens = tokenize(input);
    console.log(tokens);
}

/** @param {string} input */
function tokenize(input) {
    input = input.replace(/ /g, '');

    let symbols = new Set(['+', '-', '*', '/', '^', '(', ')', '=', 'sqrt', 'sin', 'cos', 'e', 'pi',]);

    let tokens = [];

    let curToken = '';
    while (input.length > 0) {

        let isMatchSymbol = '';
        symbols.forEach((symbol) => {
            if (input.startsWith(symbol)) {
                isMatchSymbol = symbol;
            }
        });

        if (isMatchSymbol.length > 0) {
            if (curToken.length > 0) tokens.push([curToken, 'value']);
            curToken = '';
            tokens.push([isMatchSymbol, 'symbol']);
            input = input.slice(isMatchSymbol.length);
            continue;

        } else {
            curToken += input.charAt(0);
            input = input.slice(1);
        }
    }
    if (curToken.length > 0) tokens.push([curToken, 'value']);

    return tokens
}