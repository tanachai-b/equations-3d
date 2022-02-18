//@ts-check
'use strict';


window.onload = function () {

    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 1;


    let origin = new Vector2(0, 0);
    let a = new Vector2(200, 100);
    let b = new Vector2(80, 250);
    let c = b.times(a.conjugate().unit());






    let objects = [
        origin,
        a,
        b,
        a.unit().times(new Vector2(c.x, 0)),
        a.unit().times(new Vector2(c.x, c.y)),
    ];



    objects.forEach((object) => {
        object.draw(1);
    });
}
