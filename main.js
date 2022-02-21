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

    objects.push(new Line(new Vector3(-300, 0, 0), new Vector3(300, 0, 0)));
    objects.push(new Line(new Vector3(0, -300, 0), new Vector3(0, 300, 0)));
    objects.push(new Line(new Vector3(0, 0, -300), new Vector3(0, 0, 300)));

    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                let v1 = new Vector3(i * 300, j * 300, k * 300);
                // objects.push(v1);

                if (i < 1) { objects.push(new Line(v1, v1.plus(new Vector3(2 * 300, 0, 0)))); }
                if (j < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 2 * 300, 0)))); }
                if (k < 1) { objects.push(new Line(v1, v1.plus(new Vector3(0, 0, 2 * 300)))); }
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


    objects.push(new Line(new Vector3(100, 100, 0), new Vector3(200, 200, 200)));




    let blockSize = 100;
    let memory = new Map();

    // objects = objects.concat(getGraph(blockSize, memory));

    console.log(objects.length);






    let ctx = canvas.getContext('2d');
    setInterval(() => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        objects.forEach((object) => { object.draw(camRot, camZoom); });
    }, 1000 / 60);
}

/**
 * @param {number} blockSize
 * @param {Map<any, any>} memory
 */
function getGraph(blockSize, memory) {

    let graphObjs = [];

    let blocks = [];

    for (let x = -0; x < 300; x += blockSize) {
        for (let y = -300; y < 300; y += blockSize) {
            for (let z = -300; z < 300; z += blockSize) {

                let adjPoint = [];
                for (let x1 = 0; x1 <= blockSize; x1 += blockSize) {
                    for (let y1 = 0; y1 <= blockSize; y1 += blockSize) {
                        for (let z1 = 0; z1 <= blockSize; z1 += blockSize) {
                            adjPoint.push(new Vector3(x + x1, y + y1, z + z1));
                        }
                    }
                }

                let isDraw = false;

                checkDrawLoop:
                for (let i = 0; i < adjPoint.length; i++) {
                    for (let j = i + 1; j < adjPoint.length; j++) {
                        let p1 = adjPoint[i];
                        let p2 = adjPoint[j];

                        if (calcPoint(p1.x, p1.y, p1.z, memory) != calcPoint(p2.x, p2.y, p2.z, memory)) {
                            isDraw = true;
                            break checkDrawLoop;
                        }
                    }
                }

                if (isDraw) {
                    blocks.push(new Vector3(x, y, z));
                }
            }
        }
    }

    blocks.forEach((block) => {

        let sides = [
            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(new Vector3(block.x + blockSize, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(new Vector3(block.x, block.y + blockSize, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
            calcPlane(new Vector3(block.x, block.y, block.z + blockSize), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
        ];

        let points = [];

        sides.forEach((side) => {
            if (side != null && side.length == 2) {
                // side.forEach((point) => { graphObjs.push(point); });
                graphObjs.push(new Line(side[0], side[1]));
                side.forEach((point) => { points.push(point); });
            }
        });




        // graphObjs.push(new Line(new Vector3(block.x, block.y, block.z), new Vector3(block.x, block.y + blockSize, block.z)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y, block.z + blockSize), new Vector3(block.x, block.y + blockSize, block.z + blockSize)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y, block.z), new Vector3(block.x, block.y, block.z + blockSize)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y + blockSize, block.z), new Vector3(block.x, block.y + blockSize, block.z + blockSize)));

        // graphObjs.push(new Line(new Vector3(block.x + blockSize, block.y, block.z), new Vector3(block.x + blockSize, block.y + blockSize, block.z)));
        // graphObjs.push(new Line(new Vector3(block.x + blockSize, block.y, block.z + blockSize), new Vector3(block.x + blockSize, block.y + blockSize, block.z + blockSize)));
        // graphObjs.push(new Line(new Vector3(block.x + blockSize, block.y, block.z), new Vector3(block.x + blockSize, block.y, block.z + blockSize)));
        // graphObjs.push(new Line(new Vector3(block.x + blockSize, block.y + blockSize, block.z), new Vector3(block.x + blockSize, block.y + blockSize, block.z + blockSize)));

        // graphObjs.push(new Line(new Vector3(block.x, block.y, block.z), new Vector3(block.x + blockSize, block.y, block.z)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y + blockSize, block.z), new Vector3(block.x + blockSize, block.y + blockSize, block.z)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y, block.z + blockSize), new Vector3(block.x + blockSize, block.y, block.z + blockSize)));
        // graphObjs.push(new Line(new Vector3(block.x, block.y + blockSize, block.z + blockSize), new Vector3(block.x + blockSize, block.y + blockSize, block.z + blockSize)));
    });

    return graphObjs;
}

/**
 * @param {Vector3} v1
 * @param {Vector3} v2
 * @param {Vector3} v3
 * @param {Map<any, any>} memory
 */
function calcPlane(v1, v2, v3, memory) {

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}||${v3.x}|${v3.y}|${v3.z}`)) {
        return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}||${v3.x}|${v3.y}|${v3.z}`);
    }


    let points = []

    if (points.length < 2) {
        let point = calcLine(v1, v1.plus(v2), memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(v1.plus(v3), v1.plus(v2).plus(v3), memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(v1, v1.plus(v3), memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(v1.plus(v2), v1.plus(v3).plus(v2), memory)
        if (point != null) { points.push(point); }
    }

    memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}||${v3.x}|${v3.y}|${v3.z}`, points);
    return points;
}

/**
 * @param {Vector3} v1
 * @param {Vector3} v2
 * @param {Map<any, any>} memory
 */
function calcLine(v1, v2, memory) {

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`)) { return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`); }


    let direction = v2.minus(v1).unit();
    let blockSize = v2.minus(v1).magnitude();

    let initVal = calcPoint(v1.x, v1.y, v1.z, memory);

    for (let i = 0; i <= blockSize; i += 1) {
        let point = v1.plus(direction.timesScalar(i));
        let calc = calcPoint(point.x, point.y, point.z, memory);

        if (calc == initVal) { continue; }

        memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, point);
        return point;
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {Map} memory
 */
function calcPoint(x, y, z, memory) {

    if (memory.has(`${x}|${y}|${z}`)) { return memory.get(`${x}|${y}|${z}`); }


    // let value = 100 ** 2 > (Math.sqrt(x ** 2 + y ** 2 + 0 ** 2) - 200) ** 2 + z ** 2;
    // let value = 250 ** 2 > x ** 2 + y ** 2 + z ** 2;
    let value = z ** 2 > x ** 2 + y ** 2 - 250 ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2 + 100 ** 2;

    memory.set(`${x}|${y}|${z}`, value);
    return value;
}