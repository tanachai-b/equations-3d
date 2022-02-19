//@ts-check
'use strict';


window.onload = function () {

    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');



    let mButtons = 0;

    let camPos = new Vector3(0, 0, 0);
    let camRot = new Plane(new Vector3(1, 0, 0), new Vector3(0, 1, 0));
    let camZoom = 0;

    canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); }
    canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mousemove', (event) => {
        if (mButtons == 1) {
            camRot = camRot.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
            camRot = camRot.timesXY(Vector2.polar(1, event.movementX / 2 * Math.PI / 180));
        }
    });
    canvas.addEventListener('wheel', (event) => {
        camZoom -= Math.sign(event.deltaY);
    });



    setInterval(() => {

        /** @type {[Vector2 | Vector3]} */
        let objects = [
            new Vector2(0, 0),
        ];

        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                for (let k = -1; k <= 1; k += 2) {
                    let v1 = new Vector3(i * 200, j * 200, k * 200);
                    objects.push(v1);
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                for (let k = 0; k < 10; k++) {

                    let v1 = new Vector3(i * 20 + 50, j * 20 + 30, k * 20 + 20);

                    let p1 = new Plane(new Vector3(1, 0.5, 0.5).unit(), new Vector3(-0.5, 1, 0.5));

                    let v2 = v1.timesPlane(p1);
                    let v3 = v2.overPlane(p1);

                    objects.push(v3);
                }
            }
        }

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        objects.forEach((object) => {
            object.draw(camZoom, camRot);
        });

    }, 1000 / 60);
}
