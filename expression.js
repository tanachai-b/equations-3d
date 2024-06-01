//@ts-check
'use strict';

class Expression {

    /** @param { string[][]} tokens */
    constructor(tokens) { this.tokens = tokens; }

    /** @param {string} input */
    static fromStrings(input) {
        let tokens = Expression.tokenize(input);
        return new Expression(tokens);
    }

    toStrings() {
        let result = '';
        this.tokens.forEach(token => { result += token[0] + ' '; });
        result = result.replace(/[\@\$]/g, '');
        // result = result.replace(/\( /g, '\(');
        // result = result.replace(/ \)/g, '\)');
        result = result.trim();
        return result;
    }

    /** @param {string} input */
    static tokenize(input) {
        input = '@' + input.replace(/ /g, '').toLowerCase() + '$';

        let symbols = new Set(['+', '-', '*', '/', '^', '(', ')', '=', '>', '<', 'abs', 'sqrt', 'log', 'sin', 'cos', '@', '$']);

        let tokens = [];

        let curToken = '';
        while (input.length > 0) {

            let isMatchSymbol = '';
            symbols.forEach((symbol) => { if (input.startsWith(symbol)) { isMatchSymbol = symbol; return; } });

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

    substConstants() {
        let constants = new Set(['e', 'pi',]);

        let result = [];

        this.tokens.forEach((/** @type {any[]} */ token) => {
            if (token[1] == 'value' && constants.has(token[0])) {
                switch (token[0]) {
                    case 'e': result.push([Math.E, 'value']); break;
                    case 'pi': result.push([Math.PI, 'value']); break;
                }
            } else {
                result.push([token[0], token[1]]);
            }
        });

        return new Expression(result);
    }

    substVariables(x = 0, y = 0, z = 0) {
        let constants = new Set(['x', 'y', 'z',]);

        let result = [];

        this.tokens.forEach((/** @type {any[]} */ token) => {
            if (token[1] == 'value' && constants.has(token[0])) {
                switch (token[0]) {
                    case 'x': result.push([x, 'value']); break;
                    case 'y': result.push([y, 'value']); break;
                    case 'z': result.push([z, 'value']); break;
                }
            } else {
                result.push([token[0], token[1]]);
            }
        });

        return new Expression(result);
    }

    solve() {
        let calcBox = new CalcBox();
        for (let i = 0; i < this.tokens.length; i++) { calcBox.push([this.tokens[i][0], this.tokens[i][1]]); }
        return new Expression(calcBox.tokens);
    }
}

class CalcBox {
    constructor() { this.tokens = []; }

    /** @param {string[]} token */
    push(token) {
        // console.log('input: ' + token[0]);

        this.tokens.push(token);
        // this.tokens.forEach(token => { console.log(token); });

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
                    trailing[0][1] == 'value' && !isNaN(trailing[0][0]) &&
                    trailing[1][1] == 'symbol' && valid.has(trailing[1][0]) &&
                    trailing[2][1] == 'value' && !isNaN(trailing[2][0]) &&
                    trailing[3][1] == 'symbol'
                ) {
                    let ooo1 = ooo.get(trailing[1][0]);
                    let ooo2 = ooo.get(trailing[3][0]);

                    if (ooo1 <= ooo2) {
                        this.tokens = this.tokens.slice(0, -4);
                        this.tokens.push(CalcBox.operate(trailing[0][0], trailing[1][0], trailing[2][0]));
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
                    trailing[2][1] == 'value' && !isNaN(trailing[2][0])
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

                let valid = new Set(['abs', 'sqrt', 'log', 'sin', 'cos',]);

                if (
                    trailing[0][1] == 'symbol' && valid.has(trailing[0][0]) &&
                    trailing[1][1] == 'value' && !isNaN(trailing[1][0])
                ) {
                    this.tokens = this.tokens.slice(0, -2);
                    this.tokens.push([CalcBox.func(trailing[0][0], trailing[1][0]), 'value']);
                    isUpdated = true;
                }
            }

            // if (isUpdated) {
            //     console.log('re-eval');
            //     this.tokens.forEach(token => { console.log(token); });
            // }

            if (!isUpdated) break;
        }
    }

    /**
     * @param {number} value1
     * @param {any} symbol
     * @param {number} value2
     */
    static operate(value1, symbol, value2) {

        let v1 = 1 * value1;
        let v2 = 1 * value2;

        switch (symbol) {
            case '+': return [v1 + v2, 'value'];
            case '-': return [v1 - v2, 'value'];
            case '*': return [v1 * v2, 'value'];
            case '/': return [v1 / v2, 'value'];
            case '^': return [v1 ** v2, 'value'];

            case '=': return [v1 == v2, 'result'];
            case '>': return [v1 > v2, 'result'];
            case '<': return [v1 < v2, 'result'];

            default: return [value1 + symbol + value2, 'value'];
        }
    }

    /**
     * @param {any} symbol
     * @param {number} value
     */
    static func(symbol, value) {
        switch (symbol) {
            case 'abs': return Math.abs(value);
            case 'sqrt': return Math.sqrt(value);
            case 'log': return Math.log(value);
            case 'sin': return Math.sin(value);
            case 'cos': return Math.cos(value);
            default: return symbol + value;
        }
    }
}
