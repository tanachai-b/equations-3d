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



    /** @type {[Vector2 | Vector3]} */
    let objects = [
        new Vector2(0, 0),
    ];

    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                let v1 = new Vector3(i * 300, j * 300, k * 300);
                objects.push(v1);
            }
        }
    }

    // for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 10; j++) {
    //         for (let k = 0; k < 10; k++) {

    //             let v1 = new Vector3(i * 20 + 50, j * 20 + 30, k * 20 + 20);

    //             let p1 = new Plane(new Vector3(1, 0.5, 0.5).unit(), new Vector3(-0.5, 1, 0.5));

    //             let v2 = v1.timesPlane(p1);
    //             let v3 = v2.overPlane(p1);

    //             objects.push(v3);
    //         }
    //     }
    // }

    let memory = new Map();

    let step = 10;
    for (let x = -300; x <= 300; x += step) {
        for (let y = -300; y <= 300; y += step) {
            for (let z = -300; z <= 300; z += step) {

                let value = drawFunction(x - step / 2, y - step / 2, z - step / 2);

                let isDraw = false;

                checkDrawLoop:
                for (let x1 = -step / 2; x1 <= step / 2; x1 += step) {
                    for (let y1 = -step / 2; y1 <= step / 2; y1 += step) {
                        for (let z1 = -step / 2; z1 <= step / 2; z1 += step) {
                            if (drawFunction(x + x1, y + y1, z + z1) != value) {
                                isDraw = true;
                                break checkDrawLoop;
                            }
                        }
                    }
                }

                if (isDraw) {
                    objects.push(new Vector3(x, y, z));
                }
            }
        }
    }

    console.log(objects.length);



    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    function drawFunction(x, y, z) {

        if (memory.has(`${x}|${y}|${z}`)) {
            return memory.get(`${x}|${y}|${z}`);
        } else {

            let value = 100 ** 2 > (Math.sqrt(x ** 2 + y ** 2) - 200) ** 2 + z ** 2;




            memory.set(`${x}|${y}|${z}`, value);
            return value;
        }
    }


    setInterval(() => {


        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        objects.forEach((object) => {
            object.draw(camRot, camZoom);
        });



    }, 1000 / 60);
}
