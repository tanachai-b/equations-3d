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


    /** @type {(Vector2|Vector3|Line)[]} */
    let objects = [
        // new Vector2(0, 0)
    ];

    // objects.push(new Line(new Vector3(-300, 0, 0), new Vector3(300, 0, 0)));
    // objects.push(new Line(new Vector3(0, -300, 0), new Vector3(0, 300, 0)));
    // objects.push(new Line(new Vector3(0, 0, -300), new Vector3(0, 0, 300)));

    // for (let i = -1; i <= 1; i += 2) {
    //     for (let j = -1; j <= 1; j += 2) {
    //         for (let k = -1; k <= 1; k += 2) {
    //             let v1 = new Vector3(i * 300, j * 300, k * 300);
    //             // objects.push(v1);

    //             if (i < 1) { objects.push(new Line(v1, v1.plus(new Vector3(2 * 300, 0, 0)))); }
    //             if (j < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 2 * 300, 0)))); }
    //             if (k < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 0, 2 * 300)))); }
    //         }
    //     }
    // }


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
    let blocks = new Map();

    let layerStep = 50;
    for (let layer = -300; layer <= 300; layer += layerStep) {
        objects = objects.concat(getLayer(layer, layerStep, memory, blocks, calcCount));
    }

    console.log(calcCount[0]);
    console.log(objects.length);


    let ctx = canvas.getContext('2d');
    setInterval(() => {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFFFFF    ';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        objects.forEach((object) => {
            object.draw(camRot, camZoom);
        });
    }, 1000 / 60);
}

/**
 * @param {number} layer
 * @param {number} layerStep
 * @param {Map<any, any>} memory
 * @param {Map<any, any>} blocks
 * @param {number[]} calcCount
 */
function getLayer(layer, layerStep, memory, blocks, calcCount) {

    let layerObjs = [];


    let blockStep = layerStep;
    for (let x = -300; x <= 300; x += blockStep) {
        for (let y = -300; y <= 300; y += blockStep) {
            if (blocks.has(`${layer}|${x}|${y}`)) continue;

            let blockPoints = [];

            let isDraw = false;

            calcCount[0]++;
            let val1 = drawFunction(layer - blockStep / 2, x - blockStep / 2, y - blockStep / 2, memory);

            checkDrawLoop:
            for (let l1 = -blockStep / 2; l1 <= blockStep / 2; l1 += blockStep) {
                for (let x1 = -blockStep / 2; x1 <= blockStep / 2; x1 += blockStep) {
                    for (let y1 = -blockStep / 2; y1 <= blockStep / 2; y1 += blockStep) {
                        calcCount[0]++;
                        if (drawFunction(layer + l1, x + x1, y + y1, memory) != val1) {
                            isDraw = true;
                            break checkDrawLoop;
                        }
                    }
                }
            }

            if (isDraw) {
                // blockPoints.push(new Vector3(layer , x, y));

                let linStep = 1;

                if (blockPoints.length == 0) {
                    calcCount[0]++;
                    let vall1 = drawFunction(layer - blockStep / 2, x, y, memory);

                    for (let l1 = -blockStep / 2; l1 <= blockStep / 2; l1 += linStep) {
                        calcCount[0]++;
                        if (drawFunction(layer + l1, x, y, memory) != vall1) {
                            blockPoints.push(new Vector3(layer + l1 - linStep / 2, x, y));
                            break;
                        }
                    }
                }

                if (blockPoints.length == 0) {
                    calcCount[0]++;
                    let valx1 = drawFunction(layer, x - blockStep / 2, y, memory);

                    for (let x1 = -blockStep / 2; x1 <= blockStep / 2; x1 += linStep) {
                        calcCount[0]++;
                        if (drawFunction(layer, x + x1, y, memory) != valx1) {
                            blockPoints.push(new Vector3(layer, x + x1 - linStep / 2, y));
                            break;
                        }
                    }
                }

                if (blockPoints.length == 0) {
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
            }

            layerObjs = layerObjs.concat(blockPoints);
            blocks.set(`${layer}|${x}|${y}`, blockPoints);
        }
    }

    let done = new Set();

    for (let x = -300; x <= 300; x += blockStep) {
        for (let y = -300; y <= 300; y += blockStep) {

            let thisBlock = blocks.get(`${layer}|${x}|${y}`);
            // layerObjs = layerObjs.concat(connectWithin(thisBlock));

            for (let x1 = -blockStep; x1 <= blockStep; x1 += blockStep) {
                for (let y1 = -blockStep; y1 <= blockStep; y1 += blockStep) {
                    for (let l1 = -blockStep; l1 <= blockStep; l1 += blockStep) {

                        if (done.has(`${layer}|${x}|${y}||${layer + l1}|${x + x1}|${y + y1}`)) continue;
                        if (done.has(`${layer + l1}|${x + x1}|${y + y1}||${layer}|${x}|${y}`)) continue;

                        done.add(`${layer}|${x}|${y}||${layer + l1}|${x + x1}|${y + y1}`);
                        done.add(`${layer + l1}|${x + x1}|${y + y1}||${layer}|${x}|${y}`);

                        let nextBlock = blocks.get(`${layer + l1}|${x + x1}|${y + y1}`);
                        if (nextBlock != null) { layerObjs = layerObjs.concat(connect(thisBlock, nextBlock)); }
                    }
                }
            }
        }
    }

    return layerObjs;
}

// /**
//  * @param {Vector3[]} block
//  */
// function connectWithin(block) {


//     let lines = [];


//     for (let i = 0; i < block.length - 1; i++) {
//         for (let j = i + 1; j < block.length; j++) {


//             let v = block[i];
//             let w = block[j];

//             let dist = w.minus(v).magnitude2();


//             lines.push(new Line(v, w));
//         }
//     }


//     return lines;
// }

/**
 * @param {Vector3[]} block1
 * @param {Vector3[]} block2
 */
function connect(block1, block2) {
    let lineCalc = 0;

    let lines = [];

    let minDist = Number.MAX_SAFE_INTEGER;
    let minLine = null;

    for (let i = 0; i < block1.length; i++) {
        for (let j = 0; j < block2.length; j++) {
            lineCalc++

            let v = block1[i];
            let w = block2[j];

            let dist = w.minus(v).magnitude2();

            if (dist > 0 && dist <= minDist) {
                minDist = dist;
                minLine = new Line(v, w);
            }
        }
    }

    if (minLine != null) { lines.push(minLine); }

    // console.log(lineCalc);

    return lines;
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
        let value = 100 ** 2 > (Math.sqrt(x ** 2 + y ** 2 + 0 ** 2) - 200) ** 2 + z ** 2;

        // let value = 300 ** 2 > x ** 2 + y ** 2 + z ** 2;

        // let value = z ** 2 > x ** 2 + y ** 2 - 100 ** 2;

        memory.set(`${x}|${y}|${z}`, value);

        return value;
    }
}