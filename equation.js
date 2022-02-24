//@ts-check
'use strict';

/** @param {string} input */
function compileEquation(input) {

    // let input = ' 0.5 > (sqrt(x ^ 2 + y ^ 2) - 1.25) ^ 2 + z ^ 2';
    console.log(input);

    let tokens = tokenize(input);
    substConst(tokens);
    // substVar(tokens, 1, 1, 1);

    console.log('tokens');
    tokens.forEach(token => { console.log(token); });


    tokens = solve(tokens);

    console.log('result');
    tokens.forEach(token => { console.log(token); });
}

/** @param {string} input */
function tokenize(input) {
    input = input.replace(/ /g, '') + '$';
    input = input.toLowerCase();

    let symbols = new Set(['+', '-', '*', '/', '^', '(', ')', '=', '>', '<', 'abs', 'sqrt', 'sin', 'cos', 'e', 'pi', '$', 'x', 'y', 'z',]);

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

/** @param {any[]} tokens */
function substConst(tokens) {

    let constants = new Set(['e', 'pi',]);

    tokens.forEach((token) => {
        if (token[1] == 'symbol' && constants.has(token[0])) {
            token[1] = 'value';

            switch (token[0]) {
                case 'e': token[0] = Math.E; break;
                case 'pi': token[0] = Math.PI; break;
            }
        }
    });
}

/** @param {any[]} tokens */
function substVar(tokens, x = 0, y = 0, z = 0) {

    let constants = new Set(['x', 'y', 'z',]);

    tokens.forEach((token) => {
        if (token[1] == 'symbol' && constants.has(token[0])) {
            token[1] = 'value';

            switch (token[0]) {
                case 'x': token[0] = x; break;
                case 'y': token[0] = y; break;
                case 'z': token[0] = z; break;
            }
        }
    });
}

/** @param {string[][]} tokens */
function solve(tokens) {
    let calcBox = new CalcBox();
    for (let i = 0; i < tokens.length; i++) { calcBox.push(tokens[i]); }
    return calcBox.tokens;
}

class CalcBox {
    constructor() { this.tokens = []; }

    /** @param {string[]} token */
    push(token) {
        console.log('input: ' + token[0]);

        this.tokens.push(token);
        this.tokens.forEach(token => { console.log(token); });

        this.evaluate();
    }

    evaluate() {
        let ooo = new Map([['^', 1], ['*', 2], ['/', 2], ['+', 3], ['-', 3], [')', 4], ['=', 5], ['>', 5], ['<', 5], ['$', 6],]);

        while (true) {
            let isUpdated = false;

            if (isUpdated == false && this.tokens.length >= 4) {
                let trailing = this.tokens.slice(-4);

                let valid = new Set(['+', '-', '*', '/', '^', '=', '>', '<',]);

                if (
                    trailing[0][1] == 'value' &&
                    trailing[1][1] == 'symbol' && valid.has(trailing[1][0]) &&
                    trailing[2][1] == 'value' &&
                    trailing[3][1] == 'symbol'
                ) {
                    let ooo1 = ooo.get(trailing[1][0]);
                    let ooo2 = ooo.get(trailing[3][0]);

                    if (ooo1 <= ooo2) {
                        this.tokens = this.tokens.slice(0, -4);
                        this.tokens.push([operate(trailing[0][0], trailing[1][0], trailing[2][0]), 'value']);
                        this.tokens.push(trailing[3]);
                        isUpdated = true;
                    }
                }
            }

            if (isUpdated == false && this.tokens.length >= 3) {
                let trailing = this.tokens.slice(-3);

                if (
                    trailing[0][1] == 'symbol' &&
                    trailing[1][0] == '-' &&
                    trailing[2][1] == 'value'
                ) {
                    this.tokens = this.tokens.slice(0, -3);
                    this.tokens.push(trailing[0]);
                    this.tokens.push([-trailing[2][0], 'value']);
                    isUpdated = true;
                }
            }

            if (isUpdated == false && this.tokens.length >= 3) {
                let trailing = this.tokens.slice(-3);

                if (
                    trailing[0][0] == '(' &&
                    trailing[1][1] == 'value' &&
                    trailing[2][0] == ')'
                ) {
                    this.tokens = this.tokens.slice(0, -3);
                    this.tokens.push(trailing[1]);
                    isUpdated = true;
                }
            }

            if (isUpdated == false && this.tokens.length >= 2) {
                let trailing = this.tokens.slice(-2);

                let valid = new Set(['abs', 'sqrt', 'sin', 'cos',]);

                if (
                    trailing[0][1] == 'symbol' && valid.has(trailing[0][0]) &&
                    trailing[1][1] == 'value'
                ) {
                    this.tokens = this.tokens.slice(0, -2);
                    this.tokens.push([func(trailing[0][0], trailing[1][0]), 'value']);
                    isUpdated = true;
                }
            }

            if (isUpdated) {
                console.log('re-eval');
                this.tokens.forEach(token => { console.log(token); });
            }

            if (!isUpdated) break;
        }
    }
}

/**
 * @param {any} value1
 * @param {any} symbol
 * @param {any} value2
 */
function operate(value1, symbol, value2) {

    if (isNaN(value1) || isNaN(value2)) { return value1 + symbol + value2; }

    let v1 = Number(value1);
    let v2 = Number(value2);

    switch (symbol) {
        case '+': return v1 + v2;
        case '-': return v1 - v2;
        case '*': return v1 * v2;
        case '/': return v1 / v2;
        case '^': return v1 ** v2;
        case '=': return v1 == v2;
        case '>': return v1 > v2;
        case '<': return v1 < v2;
        default: return value1 + symbol + value2;
    }
}

/**
 * @param {any} symbol
 * @param {number} value
 */
function func(symbol, value) {

    if (isNaN(value)) { return symbol + value; }

    let v = Number(value);

    switch (symbol) {
        case 'abs': return Math.abs(v);
        case 'sqrt': return Math.sqrt(v);
        case 'sin': return Math.sin(v);
        case 'cos': return Math.cos(v);
        default: return symbol + value;
    }
}