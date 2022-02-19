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


    /** @type {(Vector2|Vector3|Line)[]} */
    let objects = [new Vector2(0, 0)];

    let frame = [];
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                let v1 = new Vector3(i * 300, j * 300, k * 300);
                objects.push(v1);

                // if (i < 1) { objects.push(new Line(v1, v1.plus(new Vector3(2 * 300, 0, 0)))); }
                // if (j < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 2 * 300, 0)))); }
                // if (k < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 0, 2 * 300)))); }
            }
        }
    }

    // for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 10; j++) {
    //         for (let k = 0; k < 10; k++) {

    //             let v1 = new Vector3(i * 20 + 50, j * 20 + 30, k * 20 + 20);

    //             let p1 = new Line(new Vector3(1, 0.5, 0.5).unit(), new Vector3(-0.5, 1, 0.5));

    //             let v2 = v1.timesLine(p1);
    //             let v3 = v2.overLine(p1);

    //             objects.push(v3);
    //         }
    //     }
    // }


    let calcCount = [0];
    let memory = new Map();

    let step = 20;
    for (let x = -300; x <= 300; x += step) {
        objects = objects.concat(getLayer(x, step, memory, calcCount));
    }

    // console.log(calcCount[0]);
    // console.log(objects.length);


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
function getLayer(x, step, memory, calcCount) {

    let layer = [];

    let blocks = new Map();


    for (let y = -300; y <= 300; y += step) {
        for (let z = -300; z <= 300; z += step) {

            let blockPoints = [];

            let isDraw = false;

            calcCount[0]++;
            let value = drawFunction(x, y - step / 2, z - step / 2, memory);

            checkDrawLoop:
            for (let y1 = -step / 2; y1 <= step / 2; y1 += step) {
                for (let z1 = -step / 2; z1 <= step / 2; z1 += step) {
                    calcCount[0]++;
                    if (drawFunction(x, y + y1, z + z1, memory) != value) {
                        isDraw = true;
                        break checkDrawLoop;
                    }
                }
            }

            if (isDraw) {
                // objects.push(new Vector3(x, y, z));

                let linStep = 2;

                calcCount[0]++;
                let yval1 = drawFunction(x, y - step / 2, z, memory);

                for (let y1 = -step / 2; y1 <= step / 2; y1 += linStep) {
                    calcCount[0]++;
                    if (drawFunction(x, y + y1, z, memory) != yval1) {
                        blockPoints.push(new Vector3(x, y + y1 - linStep / 2, z));
                        break;
                    }
                }

                calcCount[0]++;
                let zval1 = drawFunction(x, y, z - step / 2, memory);

                for (let z1 = -step / 2; z1 <= step / 2; z1 += linStep) {
                    calcCount[0]++;
                    if (drawFunction(x, y, z + z1, memory) != zval1) {
                        blockPoints.push(new Vector3(x, y, z + z1 - linStep / 2));
                        break;
                    }
                }
            }

            layer = layer.concat(blockPoints);
            blocks.set(`${y}|${z}`, blockPoints);
        }
    }

    for (let y = -300; y <= 300; y += step) {
        for (let z = -300; z <= 300; z += step) {

            let thisBlock = blocks.get(`${y}|${z}`);
            if (thisBlock.length > 1) { layer.push(new Line(thisBlock[0], thisBlock[1])); }

            let rightBlock = blocks.get(`${y + step}|${z}`);
            let downBlock = blocks.get(`${y}|${z + step}`);
            let lastBlock = blocks.get(`${y + step}|${z + step}`);
            let diagBlock = blocks.get(`${y + step}|${z - step}`);

            if (rightBlock != null) { layer = layer.concat(connect(thisBlock, rightBlock)); }
            if (downBlock != null) { layer = layer.concat(connect(thisBlock, downBlock)); }
            if (lastBlock != null) { layer = layer.concat(connect(thisBlock, lastBlock)); }
            if (diagBlock != null) { layer = layer.concat(connect(thisBlock, diagBlock)); }
        }
    }

    return layer;
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


function connect(block1, block2) {
    let lineCalc = 0;

    let lines = [];

    for (let i = 0; i < block1.length; i++) {

        let minDist = Number.MAX_SAFE_INTEGER;
        let minLine = null;

        for (let j = 0; j < block2.length; j++) {
            lineCalc++

            let v = block1[i];
            let w = block2[j];

            let dist = w.minus(v).magnitude2();

            if (dist <= minDist) {
                minDist = dist;
                minLine = new Line(v, w);
            }
        }

        if (minLine != null) { lines.push(minLine); }
    }

    // console.log(lineCalc);

    return lines;
}