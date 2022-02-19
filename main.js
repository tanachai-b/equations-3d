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

    let layerStep = 50;
    for (let layer = -300; layer <= 300; layer += layerStep) {
        objects = objects.concat(getLayer(layer, memory, calcCount));
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
 * @param {number} layer
 * @param {Map<any, any>} memory
 * @param {number[]} calcCount
 */
function getLayer(layer, memory, calcCount) {

    let layerObjs = [];
    let blocks = new Map();

    let blockStep = 20;
    for (let x = -300; x <= 300; x += blockStep) {
        for (let y = -300; y <= 300; y += blockStep) {

            let blockPoints = [];

            let isDraw = false;

            calcCount[0]++;
            let val1 = drawFunction(layer, x - blockStep / 2, y - blockStep / 2, memory);

            checkDrawLoop:
            for (let x1 = -blockStep / 2; x1 <= blockStep / 2; x1 += blockStep) {
                for (let y1 = -blockStep / 2; y1 <= blockStep / 2; y1 += blockStep) {
                    calcCount[0]++;
                    if (drawFunction(layer, x + x1, y + y1, memory) != val1) {
                        isDraw = true;
                        break checkDrawLoop;
                    }
                }
            }

            if (isDraw) {
                // objects.push(new Vector3(x, y, z));

                let linStep = 1;

                calcCount[0]++;
                let valx1 = drawFunction(layer, x - blockStep / 2, y, memory);

                for (let x1 = -blockStep / 2; x1 <= blockStep / 2; x1 += linStep) {
                    calcCount[0]++;
                    if (drawFunction(layer, x + x1, y, memory) != valx1) {
                        blockPoints.push(new Vector3(layer, x + x1 - linStep / 2, y));
                        break;
                    }
                }

                calcCount[0]++;
                let valy1 = drawFunction(layer, x, y - blockStep / 2, memory);

                for (let y1 = -blockStep / 2; y1 <= blockStep / 2; y1 += linStep) {
                    calcCount[0]++;
                    if (drawFunction(layer, x, y + y1, memory) != valy1) {
                        blockPoints.push(new Vector3(layer, x, y + y1 - linStep / 2));
                        break;
                    }
                }
            }

            // layerObjs = layerObjs.concat(blockPoints);
            blocks.set(`${x}|${y}`, blockPoints);
        }
    }

    for (let x = -300; x <= 300; x += blockStep) {
        for (let y = -300; y <= 300; y += blockStep) {

            let thisBlock = blocks.get(`${x}|${y}`);
            if (thisBlock.length > 1) { layerObjs.push(new Line(thisBlock[0], thisBlock[1])); }

            let rightBlock = blocks.get(`${x + blockStep}|${y}`);
            let downBlock = blocks.get(`${x}|${y + blockStep}`);
            let lastBlock = blocks.get(`${x + blockStep}|${y + blockStep}`);
            let diagBlock = blocks.get(`${x + blockStep}|${y - blockStep}`);

            if (rightBlock != null) { layerObjs = layerObjs.concat(connect(thisBlock, rightBlock)); }
            if (downBlock != null) { layerObjs = layerObjs.concat(connect(thisBlock, downBlock)); }
            if (lastBlock != null) { layerObjs = layerObjs.concat(connect(thisBlock, lastBlock)); }
            if (diagBlock != null) { layerObjs = layerObjs.concat(connect(thisBlock, diagBlock)); }
        }
    }

    return layerObjs;
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


/**
 * @param {Vector3[]} block1
 * @param {Vector3[]} block2
 */
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