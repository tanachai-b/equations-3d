//@ts-check
'use strict';

function compileEquation() {
    let input = '55 = x - 5 * y + c';


    let symbols = new Map([
        ['(', { type: 'bracket', order: 0 }],
        [')', { type: 'bracket', order: 0 }],
        ['^', { type: 'operator', order: 2 }],
        ['*', { type: 'operator', order: 3 }],
        ['/', { type: 'operator', order: 3 }],
        ['+', { type: 'operator', order: 4 }],
        ['-', { type: 'operator', order: 4 }],
        ['=', { type: 'bracket', order: 9 }],
    ]);


    let numbers = /[0123456789]/g;
    let letters = /[A-Za-z]/g;
    let opeartors = /[\+\-\*\/\^]/g;
    let braces = /[\(\)]/g;

    input = input.replace(/ /g, '');

    for (let i = 0; i < input.length; i++) {
        let char = input.charAt(i);
        console.log(char);

        
    }



    console.log(input);
}
