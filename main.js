//@ts-check
'use strict';

window.onload = function () {

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let urlEquation = urlParams.get('equation')

    /** @type {HTMLInputElement} */
    // @ts-ignore
    let equationInput = document.getElementById('equation');
    equationInput.value = urlEquation;
    if (equationInput.value == '') equationInput.value = 'y = x + 5';

    let sampleDropdown = document.getElementById('sample');
    sampleDropdown.onchange = function () {
        // @ts-ignore 
        let choice = sampleDropdown.options[sampleDropdown.selectedIndex].innerHTML;
        // @ts-ignore
        equationInput.value = choice;
    }

    compileEquation();


    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');


    canvas.focus();
    canvas.addEventListener('keypress', (event) => {
        switch (event.key) { case ' ': camera.reset(); break; }
    });


    let camera = new Camera();

    /** @type {(Vector2|Vector3|Line|Plane|Polygon3|Text3|Polygon2)[]} */
    let objects = [];

    let axisSize = 300;
    let frameSize = 250;
    let step = 25;

    drawAxis(objects, axisSize, frameSize, step);
    drawFrame(objects, frameSize, step);

    let blockSize = 25;
    objects = objects.concat(plotGraph(frameSize, blockSize));


    let ctx = canvas.getContext('2d');
    setInterval(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        camera.update();

        let sorting = [];

        objects.forEach((object) => {
            let depth = object.depth(camera);
            sorting.push([object, depth]);
        });

        sorting.sort((a, b) => { return b[1] - a[1]; });
        sorting.forEach((object) => { object[0].draw(camera); });

    }, 1000 / 60);
}

/**
 * @param {(Vector3 | Line | Vector2 | Plane | Polygon3 | Text3 | Polygon2)[]} objects
 * @param {number} axisSize
 * @param {number} frameSize
 * @param {number} step
 */
function drawAxis(objects, axisSize, frameSize, step) {

    for (let i = -axisSize; i < axisSize; i += step) {
        objects.push(new Line(new Vector3(i, 0, 0), new Vector3(i + step, 0, 0)));
        objects.push(new Line(new Vector3(0, i, 0), new Vector3(0, i + step, 0)));
        objects.push(new Line(new Vector3(0, 0, i), new Vector3(0, 0, i + step)));
    }

    let arrowHead = [new Vector2(0, 5), new Vector2(20, 0), new Vector2(0, -5)];
    objects.push(new Polygon2(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), arrowHead));
    objects.push(new Polygon2(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), arrowHead));
    objects.push(new Polygon2(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), arrowHead));

    objects.push(new Text3(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), new Vector2(30, 0), `x`));
    objects.push(new Text3(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), new Vector2(30, 0), `y`));
    objects.push(new Text3(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), new Vector2(30, 0), `z`));


    objects.push(new Text3(new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector2(0, -12), `0`));

    for (let i = -frameSize; i <= frameSize; i += 125) {
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
 * @param {number} frameSize
 * @param {number} step
 */
function drawFrame(objects, frameSize, step) {

    for (let i = -frameSize; i < frameSize; i += step) {
        objects.push(new Line(new Vector3(i, -frameSize, -frameSize), new Vector3(i + step, -frameSize, -frameSize)));
        objects.push(new Line(new Vector3(i, frameSize, -frameSize), new Vector3(i + step, frameSize, -frameSize)));
        objects.push(new Line(new Vector3(i, -frameSize, frameSize), new Vector3(i + step, -frameSize, frameSize)));
        objects.push(new Line(new Vector3(i, frameSize, frameSize), new Vector3(i + step, frameSize, frameSize)));

        objects.push(new Line(new Vector3(-frameSize, i, -frameSize), new Vector3(-frameSize, i + step, -frameSize)));
        objects.push(new Line(new Vector3(frameSize, i, -frameSize), new Vector3(frameSize, i + step, -frameSize)));
        objects.push(new Line(new Vector3(-frameSize, i, frameSize), new Vector3(-frameSize, i + step, frameSize)));
        objects.push(new Line(new Vector3(frameSize, i, frameSize), new Vector3(frameSize, i + step, frameSize)));

        objects.push(new Line(new Vector3(-frameSize, -frameSize, i), new Vector3(-frameSize, -frameSize, i + step)));
        objects.push(new Line(new Vector3(frameSize, -frameSize, i), new Vector3(frameSize, -frameSize, i + step)));
        objects.push(new Line(new Vector3(-frameSize, frameSize, i), new Vector3(-frameSize, frameSize, i + step)));
        objects.push(new Line(new Vector3(frameSize, frameSize, i), new Vector3(frameSize, frameSize, i + step)));
    }
}

class Camera {
    constructor() {
        this.position = new Vector3(0, 0, 0);

        this.rotation = Line.default();
        this.rotation = this.rotation.timesXZ(Vector2.polar(1, 30 * Math.PI / 180));
        this.rotation = this.rotation.timesYZ(Vector2.polar(1, 30 * Math.PI / 180));

        this.zoom = 0;


        this.destPosition = this.position;
        this.destRotation = this.rotation;
        this.destZoom = this.zoom;


        this.addMouseListener();
    }

    addMouseListener() {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let mButtons = 0;

        canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); };
        canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; mButtons = 0; });

        canvas.addEventListener('mousemove', (event) => {
            if (mButtons == 1) {
                // this.rotation = this.rotation.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
                // this.rotation = this.rotation.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
                this.destRotation = this.destRotation.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
                this.destRotation = this.destRotation.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
                // this.destRotation = this.destRotation.timesXY(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
            }
        });
        canvas.addEventListener('wheel', (event) => {
            // this.zoom -= Math.sign(event.deltaY);
            this.destZoom -= Math.sign(event.deltaY);
        });
    }

    reset() {
        let dr2 = Line.default()
        dr2 = dr2.timesXZ(Vector2.polar(1, 30 * Math.PI / 180));
        dr2 = dr2.timesYZ(Vector2.polar(1, 30 * Math.PI / 180));
        this.destRotation = dr2;

        this.destZoom = 0;
    }

    update() {
        let mvtFactor = 3;


        let diffLine = this.destRotation.overLine(this.rotation);

        let diffDir = diffLine.v.yz().unit();
        let diffAngle = diffLine.v.timesYZ(diffDir.conjugate()).xy().angle();


        let rollLine = diffLine.w;
        rollLine.timesYZ(diffDir.conjugate());
        rollLine.timesXY(diffLine.v.timesYZ(diffDir.conjugate()).xy().conjugate());
        rollLine.timesYZ(diffDir);

        let diffRoll = rollLine.yz().angle();


        let newV = Vector3.polar(1, diffAngle / mvtFactor, 0).timesYZ(diffDir);
        let newW = Vector3.polar(1, Math.PI / 2, diffRoll / mvtFactor).times(newV);
        let stepRot = new Line(newV, newW);


        this.rotation = stepRot.timesLine(this.rotation);
        this.zoom += (this.destZoom - this.zoom) / mvtFactor;
    }
}