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


    /** @type {(Vector2|Vector3|Plane)[]} */
    let objects = [new Vector2(0, 0)];

    let frame = [];
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                let v1 = new Vector3(i * 300, j * 300, k * 300);
                objects.push(v1);

                // if (i < 1) { objects.push(new Plane(v1, v1.plus(new Vector3(2 * 300, 0, 0)))); }
                // if (j < 1) { objects.push(new Plane(v1, v1.plus(new Vector3(0, 2 * 300, 0)))); }
                // if (k < 1) { objects.push(new Plane(v1, v1.plus(new Vector3(0, 0, 2 * 300)))); }
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


    let calcCount = [0];
    let memory = new Map();

    let step = 20;
    for (let x = -300; x <= 300; x += step) {
        let layerPoints = getLayerPoints(x, step, memory, calcCount);
        objects = objects.concat(layerPoints);

        console.log(layerPoints.length);
    }

    console.log(calcCount[0]);
    console.log(objects.length);


    let ctx = canvas.getContext('2d');
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((object) => {
            object.draw(camRot, camZoom);
        });
    }, 1000 / 60);
}

/**
 * @param {number} x
 * @param {number} step
 * @param {Map<any, any>} memory
 * @param {number[]} calcCount
 */
function getLayerPoints(x, step, memory, calcCount) {

    let layerPoints = [];

    for (let y = -300; y <= 300; y += step) {
        for (let z = -300; z <= 300; z += step) {

            let isDraw = false;

            calcCount[0]++;
            let value = drawFunction(x - step / 2, y - step / 2, z - step / 2, memory);

            checkDrawLoop:
            for (let x1 = -step / 2; x1 <= step / 2; x1 += step) {
                for (let y1 = -step / 2; y1 <= step / 2; y1 += step) {
                    for (let z1 = -step / 2; z1 <= step / 2; z1 += step) {
                        calcCount[0]++;
                        if (drawFunction(x + x1, y + y1, z + z1, memory) != value) {
                            isDraw = true;
                            break checkDrawLoop;
                        }
                    }
                }
            }

            if (!isDraw) { continue; }
            // objects.push(new Vector3(x, y, z));


            let linStep = 2;

            calcCount[0]++;
            let yval1 = drawFunction(x, y - step / 2, z, memory);

            for (let y1 = -step / 2; y1 <= step / 2; y1 += linStep) {
                calcCount[0]++;
                if (drawFunction(x, y + y1, z, memory) != yval1) {
                    layerPoints.push(new Vector3(x, y + y1 - linStep / 2, z));
                    break;
                }
            }

            calcCount[0]++;
            let zval1 = drawFunction(x, y, z - step / 2, memory);

            for (let z1 = -step / 2; z1 <= step / 2; z1 += linStep) {
                calcCount[0]++;
                if (drawFunction(x, y, z + z1, memory) != zval1) {
                    layerPoints.push(new Vector3(x, y, z + z1 - linStep / 2));
                    break;
                }
            }
        }
    }

    return layerPoints;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {Map} memory
 */
function drawFunction(x, y, z, memory) {

    if (memory.has(`${x}|${y}|${z}`)) {
        return memory.get(`${x}|${y}|${z}`);

    } else {
        let value = 100 ** 2 > (Math.sqrt(x ** 2 + y ** 2) - 200) ** 2 + z ** 2;
        memory.set(`${x}|${y}|${z}`, value);

        return value;
    }
}