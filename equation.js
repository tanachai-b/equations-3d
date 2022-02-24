//@ts-check
'use strict';

function compileEquation() {

    let input = '1+2*3-9';
    // console.log(input);

    let tokens = tokenize(input);
    // console.log(tokens);

    let result = solve(tokens);
    // console.log(result.tokens);
}

/** @param {string} input */
function tokenize(input) {
    input = input.replace(/ /g, '') + '$';

    let symbols = new Set(['+', '-', '*', '/', '^', '(', ')', '=', 'sqrt', 'sin', 'cos', 'e', 'pi', '$']);

    let tokens = [];

    let curToken = '';
    while (input.length > 0) {

        let isMatchSymbol = '';
        symbols.forEach((symbol) => {
            if (input.startsWith(symbol)) {
                isMatchSymbol = symbol;
                return;
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

/** @param {string[][]} tokens */
function solve(tokens) {

    let box = new Box();

    for (let i = 0; i < tokens.length; i++) {
        box.push(tokens[i]);
    }

    return box;
}

class Box {
    constructor() { this.tokens = []; }

    /** @param {string[]} token */
    push(token) {
        console.log('input: ' + token[0]);

        this.tokens.push(token);
        this.evaluate();

        this.tokens.forEach(token => { console.log(token); });
    }

    evaluate() {


        let ooo = new Map([
            ['(', 1],
            ['sqrt', 2],
            ['sin', 2],
            ['cos', 2],
            ['^', 3],
            ['*', 4],
            ['/', 4],
            ['+', 5],
            ['-', 5],
            [')', 9],
            ['=', 9],
            ['$', 9],
        ]);

        if (this.tokens.length >= 4) {
            let trailing = this.tokens.slice(-4);

            if (
                trailing[0][1] == 'value' &&
                trailing[1][1] == 'symbol' &&
                trailing[2][1] == 'value' &&
                trailing[3][1] == 'symbol'
            ) {
                // if (
                //     trailing[1][0] == '+' &&
                //     trailing[3][0] == '+'
                // ) {
                this.tokens = this.tokens.slice(0, -4);
                this.tokens.push([trailing[0][0] + trailing[1][0] + trailing[2][0], 'value']);
                this.tokens.push(trailing[3]);
                // }
            }
        }
    }
}