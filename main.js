//@ts-check
'use strict';

window.onload = function () {

    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');


    let mButtons = 0;

    let camPos = new Vector3(0, 0, 0);
    let camRot = new Line(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
    let camZoom = 0;

    camRot = camRot.timesXZ(Vector2.polar(1, 30 * Math.PI / 180));
    camRot = camRot.timesYZ(Vector2.polar(1, 30 * Math.PI / 180));

    canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); }
    canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mousemove', (event) => {
        if (mButtons == 1) {
            camRot = camRot.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
            camRot = camRot.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
        }
    });
    canvas.addEventListener('wheel', (event) => {
        camZoom -= Math.sign(event.deltaY);
    });


    /** @type {(Vector2|Vector3|Line|Plane|Polygon3|Text3|Polygon2)[]} */
    let objects = [];

    let axisSize = 300;
    let boxSize = 250;
    let step = 20;

    drawAxis(objects, axisSize, boxSize, step);
    drawFrame(objects, boxSize, step);


    let blockSize = 25;
    objects = objects.concat(plotGraph(boxSize, blockSize));


    let ctx = canvas.getContext('2d');
    setInterval(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let sorting = [];

        objects.forEach((object) => {
            let depth = object.depth(camRot, camZoom);
            sorting.push([object, depth]);
        });

        sorting.sort((a, b) => { return b[1] - a[1]; });
        sorting.forEach((object) => { object[0].draw(camRot, camZoom); });

    }, 1000 / 60);
}

/**
 * @param {(Vector3 | Line | Vector2 | Plane | Polygon3 | Text3 | Polygon2)[]} objects
 * @param {number} axisSize
 * @param {number} boxSize
 * @param {number} step
 */
function drawAxis(objects, axisSize, boxSize, step) {

    for (let i = -axisSize; i < axisSize; i += step) {
        objects.push(new Line(new Vector3(i, 0, 0), new Vector3(i + step, 0, 0)));
        objects.push(new Line(new Vector3(0, i, 0), new Vector3(0, i + step, 0)));
        objects.push(new Line(new Vector3(0, 0, i), new Vector3(0, 0, i + step)));
    }


    objects.push(new Polygon2(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), [new Vector2(0, 5), new Vector2(20, 0), new Vector2(0, -5)]));
    objects.push(new Polygon2(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), [new Vector2(0, 5), new Vector2(20, 0), new Vector2(0, -5)]));
    objects.push(new Polygon2(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), [new Vector2(0, 5), new Vector2(20, 0), new Vector2(0, -5)]));

    objects.push(new Text3(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), new Vector2(30, 0), `x`));
    objects.push(new Text3(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), new Vector2(30, 0), `y`));
    objects.push(new Text3(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), new Vector2(30, 0), `z`));


    objects.push(new Text3(new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector2(0, -12), `0`));

    for (let i = -boxSize; i <= boxSize; i += 125) {
        if (i == 0) continue;

        objects.push(new Polygon2(new Vector3(i, 0, 0), new Vector3(1, 0, 0), [new Vector2(0, -5), new Vector2(0, 0)]));
        objects.push(new Polygon2(new Vector3(0, i, 0), new Vector3(0, 1, 0), [new Vector2(0, -5), new Vector2(0, 0)]));
        objects.push(new Polygon2(new Vector3(0, 0, i), new Vector3(0, 0, 1), [new Vector2(0, -5), new Vector2(0, 0)]));

        objects.push(new Text3(new Vector3(i, 0, 0), new Vector3(1, 0, 0), new Vector2(0, -12), `${i / 125}`));
        objects.push(new Text3(new Vector3(0, i, 0), new Vector3(0, 1, 0), new Vector2(0, -12), `${i / 125}`));
        objects.push(new Text3(new Vector3(0, 0, i), new Vector3(0, 0, 1), new Vector2(0, -12), `${i / 125}`));
    }
}

/**
 * @param {(Vector3 | Line | Vector2 | Plane | Polygon3 | Text3 | Polygon2)[]} objects
 * @param {number} boxSize
 * @param {number} step
 */
function drawFrame(objects, boxSize, step) {

    for (let i = -boxSize; i < boxSize; i += step) {
        objects.push(new Line(new Vector3(i, -boxSize, -boxSize), new Vector3(i + step, -boxSize, -boxSize)));
        objects.push(new Line(new Vector3(i, boxSize, -boxSize), new Vector3(i + step, boxSize, -boxSize)));
        objects.push(new Line(new Vector3(i, -boxSize, boxSize), new Vector3(i + step, -boxSize, boxSize)));
        objects.push(new Line(new Vector3(i, boxSize, boxSize), new Vector3(i + step, boxSize, boxSize)));

        objects.push(new Line(new Vector3(-boxSize, i, -boxSize), new Vector3(-boxSize, i + step, -boxSize)));
        objects.push(new Line(new Vector3(boxSize, i, -boxSize), new Vector3(boxSize, i + step, -boxSize)));
        objects.push(new Line(new Vector3(-boxSize, i, boxSize), new Vector3(-boxSize, i + step, boxSize)));
        objects.push(new Line(new Vector3(boxSize, i, boxSize), new Vector3(boxSize, i + step, boxSize)));

        objects.push(new Line(new Vector3(-boxSize, -boxSize, i), new Vector3(-boxSize, -boxSize, i + step)));
        objects.push(new Line(new Vector3(boxSize, -boxSize, i), new Vector3(boxSize, -boxSize, i + step)));
        objects.push(new Line(new Vector3(-boxSize, boxSize, i), new Vector3(-boxSize, boxSize, i + step)));
        objects.push(new Line(new Vector3(boxSize, boxSize, i), new Vector3(boxSize, boxSize, i + step)));
    }
}