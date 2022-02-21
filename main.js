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

    camRot = camRot.timesXY(Vector2.polar(1, 30 * Math.PI / 180));
    camRot = camRot.timesYZ(Vector2.polar(1, 30 * Math.PI / 180));

    canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); }
    canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mousemove', (event) => {
        if (mButtons == 1) {
            camRot = camRot.timesXY(Vector2.polar(1, event.movementX / 2 * Math.PI / 180));
            camRot = camRot.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
        }
    });
    canvas.addEventListener('wheel', (event) => {
        camZoom -= Math.sign(event.deltaY);
    });



    /** @type {(Vector2|Vector3|Line|Plane)[]} */
    let objects = [];

    objects.push(new Line(new Vector3(-300, 0, 0), new Vector3(300, 0, 0)));
    objects.push(new Line(new Vector3(0, -300, 0), new Vector3(0, 300, 0)));
    objects.push(new Line(new Vector3(0, 0, -300), new Vector3(0, 0, 300)));

    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                let v1 = new Vector3(i * 300, j * 300, k * 300);

                if (i < 1) { objects.push(new Line(v1, v1.plus(new Vector3(2 * 300, 0, 0)))); }
                if (j < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 2 * 300, 0)))); }
                if (k < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 0, 2 * 300)))); }
            }
        }
    }


    let blockSize = 100;
    let memory = new Map();
    objects = objects.concat(getGraph(blockSize, memory));
    console.log(objects.length);


    objects.push(new Plane(new Vector3(-300, -300, -300), new Vector3(300, -300, -300), new Vector3(300, -300, 300)));
    objects.push(new Plane(new Vector3(-300, 300, 300), new Vector3(300, 300, -300), new Vector3(300, 300, 300)));



    let ctx = canvas.getContext('2d');
    setInterval(() => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let projected = [];

        objects.forEach((object) => {
            // object.draw(camRot, camZoom);
            projected.push(object.projectx(camRot, camZoom));
        });

        projected.forEach((object) => { object.drawx(); });

    }, 1000 / 60);
}