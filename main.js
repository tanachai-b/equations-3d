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
    let xyBlocks = new Map();
    let ylBlocks = new Map();
    let xlBlocks = new Map();

    let layerStep = 50;

    objects = objects.concat(getGraph(layerStep, memory, xyBlocks, ylBlocks, xlBlocks, calcCount));


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
 * @param {number} layerStep
 * @param {Map<any, any>} memory
 * @param {Map<any, any>} xyBlocks
 * @param {Map<any, any>} ylBlocks
 * @param {Map<any, any>} xlBlocks
 * @param {number[]} calcCount
 */
function getGraph(layerStep, memory, xyBlocks, ylBlocks, xlBlocks, calcCount) {

    let graphObjs = [];
    let blockStep = layerStep;

    for (let layer = -300; layer <= 300; layer += layerStep) {
        for (let x = -300; x <= 300; x += blockStep) {
            for (let y = -300; y <= 300; y += blockStep) {

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
                    let xyBlock = [];
                    let ylBlock = [];
                    let xlBlock = [];

                    let linStep = 1;

                    calcCount[0]++;
                    let valx1 = drawFunction(layer, x - blockStep / 2, y, memory);

                    for (let x1 = -blockStep / 2; x1 <= blockStep / 2; x1 += linStep) {
                        calcCount[0]++;
                        if (drawFunction(layer, x + x1, y, memory) != valx1) {
                            xyBlock.push(new Vector3(layer, x + x1 - linStep / 2, y));
                            xlBlock.push(new Vector3(layer, x + x1 - linStep / 2, y));
                            break;
                        }
                    }

                    calcCount[0]++;
                    let valy1 = drawFunction(layer, x, y - blockStep / 2, memory);

                    for (let y1 = -blockStep / 2; y1 <= blockStep / 2; y1 += linStep) {
                        calcCount[0]++;
                        if (drawFunction(layer, x, y + y1, memory) != valy1) {
                            xyBlock.push(new Vector3(layer, x, y + y1 - linStep / 2));
                            ylBlock.push(new Vector3(layer, x, y + y1 - linStep / 2));
                            break;
                        }
                    }

                    calcCount[0]++;
                    let vall1 = drawFunction(layer - blockStep / 2, x, y, memory);

                    for (let l1 = -blockStep / 2; l1 <= blockStep / 2; l1 += linStep) {
                        calcCount[0]++;
                        if (drawFunction(layer + l1, x, y, memory) != vall1) {
                            ylBlock.push(new Vector3(layer + l1 - linStep / 2, x, y));
                            xlBlock.push(new Vector3(layer + l1 - linStep / 2, x, y));
                            break;
                        }
                    }

                    if (xyBlock.length > 0) {
                        // layerObjs = layerObjs.concat(xyBlock);
                        xyBlocks.set(`${layer}|${x}|${y}`, xyBlock);
                    }

                    if (ylBlock.length > 0) {
                        // layerObjs = layerObjs.concat(ylBlock);
                        ylBlocks.set(`${layer}|${x}|${y}`, ylBlock);
                    }

                    if (xlBlock.length > 0) {
                        // layerObjs = layerObjs.concat(xlBlock);
                        xlBlocks.set(`${layer}|${x}|${y}`, xlBlock);
                    }
                }
            }
        }

        for (let x = -300; x <= 300; x += blockStep) {
            for (let y = -300; y <= 300; y += blockStep) {

                let thisXyBlock = xyBlocks.get(`${layer}|${x}|${y}`)
                if (thisXyBlock != null && thisXyBlock.length > 1) {
                    graphObjs = graphObjs.concat(connectWithin(thisXyBlock));
                }

                let adjXyBlocks = [];

                for (let x1 = 0; x1 <= blockStep; x1 += blockStep) {
                    for (let y1 = 0; y1 <= blockStep; y1 += blockStep) {
                        if (xyBlocks.has(`${layer}|${x + x1}|${y + y1}`)) {
                            adjXyBlocks.push(xyBlocks.get(`${layer}|${x + x1}|${y + y1}`));
                        }
                    }
                }

                for (let i = 0; i < adjXyBlocks.length - 1; i++) {
                    for (let j = i + 1; j < adjXyBlocks.length; j++) {
                        if (adjXyBlocks[i] != null && adjXyBlocks[j] != null) {
                            graphObjs = graphObjs.concat(connect(adjXyBlocks[i], adjXyBlocks[j]));
                        }
                    }
                }


                let thisYlBlock = ylBlocks.get(`${layer}|${x}|${y}`)
                if (thisYlBlock != null && thisYlBlock.length > 1) {
                    graphObjs = graphObjs.concat(connectWithin(thisYlBlock));
                }

                let adjYlBlocks = [];

                for (let l1 = 0; l1 >= -blockStep; l1 -= blockStep) {
                    for (let y1 = 0; y1 <= blockStep; y1 += blockStep) {
                        if (ylBlocks.has(`${layer + l1}|${x}|${y + y1}`)) {
                            adjYlBlocks.push(ylBlocks.get(`${layer + l1}|${x}|${y + y1}`));
                        }
                    }
                }

                for (let i = 0; i < adjYlBlocks.length - 1; i++) {
                    for (let j = i + 1; j < adjYlBlocks.length; j++) {
                        if (adjYlBlocks[i] != null && adjYlBlocks[j] != null) {
                            graphObjs = graphObjs.concat(connect(adjYlBlocks[i], adjYlBlocks[j]));
                        }
                    }
                }


                let thisXlBlock = xlBlocks.get(`${layer}|${x}|${y}`)
                if (thisXlBlock != null && thisXlBlock.length > 1) {
                    graphObjs = graphObjs.concat(connectWithin(thisXlBlock));
                }

                let adjXlBlocks = [];

                for (let l1 = 0; l1 >= -blockStep; l1 -= blockStep) {
                    for (let x1 = 0; x1 <= blockStep; x1 += blockStep) {
                        if (xlBlocks.has(`${layer + l1}|${x + x1}|${y}`)) {
                            adjXlBlocks.push(xlBlocks.get(`${layer + l1}|${x + x1}|${y}`));
                        }
                    }
                }

                for (let i = 0; i < adjXlBlocks.length - 1; i++) {
                    for (let j = i + 1; j < adjXlBlocks.length; j++) {
                        if (adjXlBlocks[i] != null && adjXlBlocks[j] != null) {
                            graphObjs = graphObjs.concat(connect(adjXlBlocks[i], adjXlBlocks[j]));
                        }
                    }
                }
            }
        }

    }


    return graphObjs;


}


/**
 * @param {Vector3[]} block
 */
function connectWithin(block) {
    if (block.length > 1) {
        return [new Line(block[0], block[1])];
    } else {
        return null;
    }
}

/**
 * @param {Vector3[]} block1
 * @param {Vector3[]} block2
 */
function connect(block1, block2) {

    let lines = [];

    let minDist = Number.MAX_SAFE_INTEGER;
    let minLine = null;

    for (let i = 0; i < block1.length; i++) {
        for (let j = 0; j < block2.length; j++) {

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
        // let value = 100 ** 2 > (Math.sqrt(x ** 2 + y ** 2 + 0 ** 2) - 200) ** 2 + z ** 2;

        // let value = 275 ** 2 > x ** 2 + y ** 2 + z ** 2;

        // let value = z ** 2 > x ** 2 + y ** 2 - 100 ** 2;

        let value = z ** 2 > x ** 2 + y ** 2 + 100 ** 2;

        memory.set(`${x}|${y}|${z}`, value);

        return value;
    }
}