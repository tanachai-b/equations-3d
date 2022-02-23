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

    camRot = camRot.timesXZ(Vector2.polar(1, 0.001 * Math.PI / 180));
    camRot = camRot.timesYZ(Vector2.polar(1, 0.001 * Math.PI / 180));

    canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); }
    // canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
    // canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
    // canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
    // canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
    // canvas.addEventListener('mousemove', (event) => {
    //     if (mButtons == 1) {
    //         camRot = camRot.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
    //         camRot = camRot.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
    //     }
    // });
    // canvas.addEventListener('wheel', (event) => {
    //     camZoom -= Math.sign(event.deltaY);
    // });


    /** @type {(Vector2|Vector3|Line|Plane|Polygon2)[]} */
    let objects = [];

    let axisSize = 300;
    let boxSize = 250;
    let step = 20;

    for (let i = -axisSize; i < axisSize; i += step) {
        objects.push(new Line(new Vector3(i, 0, 0), new Vector3(i + step, 0, 0)));
        objects.push(new Line(new Vector3(0, i, 0), new Vector3(0, i + step, 0)));
        objects.push(new Line(new Vector3(0, 0, i), new Vector3(0, 0, i + step)));
    }

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

    let blockSize = 25;
    let memory = new Map();
    objects = objects.concat(getGraph(boxSize, blockSize, memory));


    let ctx = canvas.getContext('2d');
    setInterval(() => {
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