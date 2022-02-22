//@ts-check
'use strict';

/**
 * @param {number} blockSize
 * @param {Map<any, any>} memory
 */
function getGraph(blockSize, memory) {

    let bigBlockSize = blockSize * 2;

    let bigBlocks = [];

    for (let x = -300; x < 300; x += bigBlockSize) {
        for (let y = -300; y < 300; y += bigBlockSize) {
            for (let z = -300; z < 300; z += bigBlockSize) {

                if (checkBlock(x, y, z, bigBlockSize, memory)) {
                    bigBlocks.push(new Vector3(x, y, z));
                    continue;
                }
            }
        }
    }


    let blocks = [];

    bigBlocks.forEach((bigBlock) => {
        for (let x = bigBlock.x; x < bigBlock.x + bigBlockSize; x += blockSize) {
            for (let y = bigBlock.y; y < bigBlock.y + bigBlockSize; y += blockSize) {
                for (let z = bigBlock.z; z < bigBlock.z + bigBlockSize; z += blockSize) {

                    if (checkBlock(x, y, z, blockSize, memory)) {
                        blocks.push(new Vector3(x, y, z));
                        continue;
                    }
                }
            }
        }
    });



    let graphObjs = [];

    blocks.forEach((block) => {

        let sides = [
            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(new Vector3(block.x + blockSize, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(new Vector3(block.x, block.y + blockSize, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
            calcPlane(new Vector3(block.x, block.y, block.z + blockSize), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
        ];


        let pointMem = new Set();
        let points = [];

        sides.forEach((side) => {
            if (side != null && side.length == 2) {

                side.forEach((/** @type {Vector3} */ point) => {
                    if (!pointMem.has(`${point.x}|${point.y}|${point.z}`)) {
                        pointMem.add(`${point.x}|${point.y}|${point.z}`);
                        points.push(point);
                    }
                });
            }
        });


        if (points.length >= 3) { graphObjs = graphObjs.concat(new Polygon2(points)); }
    });

    return graphObjs;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} blockSize
 * @param {Map<any, any>} memory
 */
function checkBlock(x, y, z, blockSize, memory) {

    if ((calcPoint(x, y, z, memory) != calcPoint(x + blockSize, y, z, memory))) { return true; }
    if ((calcPoint(x, y + blockSize, z, memory) != calcPoint(x + blockSize, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(x, y, z + blockSize, memory) != calcPoint(x + blockSize, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(x, y + blockSize, z + blockSize, memory) != calcPoint(x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }

    if ((calcPoint(x, y, z, memory) != calcPoint(x, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(x + blockSize, y, z, memory) != calcPoint(x + blockSize, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(x, y, z + blockSize, memory) != calcPoint(x, y + blockSize, z + blockSize, memory))) { return true; }
    if ((calcPoint(x + blockSize, y, z + blockSize, memory) != calcPoint(x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }

    if ((calcPoint(x, y, z, memory) != calcPoint(x, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(x + blockSize, y, z, memory) != calcPoint(x + blockSize, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(x, y + blockSize, z, memory) != calcPoint(x, y + blockSize, z + blockSize, memory))) { return true; }
    if ((calcPoint(x + blockSize, y + blockSize, z, memory) != calcPoint(x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }
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

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`)) {
        return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`);
    }


    let lineStep = 1;

    let direction = v2.minus(v1).unit();
    let blockSize = v2.minus(v1).magnitude();

    let initVal = calcPoint(v1.x, v1.y, v1.z, memory);

    for (let i = lineStep; i <= blockSize; i += lineStep) {
        let point = v1.plus(direction.timesScalar(i));
        let calc = calcPoint(point.x, point.y, point.z, memory);

        if (calc == initVal) { continue; }

        let result = v1.plus(direction.timesScalar(i - lineStep / 2));
        memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, result);
        return result;
    }

    memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, null);
    return null;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {Map} memory
 */
function calcPoint(x, y, z, memory) {

    x = x / 200;
    y = y / 200;
    z = z / 200;

    if (memory.has(`${x}|${y}|${z}`)) { return memory.get(`${x}|${y}|${z}`); }


    // let value = 2.5 ** 4 > (x/1.2) ** 4 + y ** 4 + (z/0.8) ** 4;
    // let value = z ** 2 > x ** 2 + y ** 2 - 1 ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2 + 1 ** 2;
    // let value = 1 > (Math.sqrt(x ** 2 + y ** 2) - 2) ** 2 + z ** 2;
    // let value = z > 10 * (x * y) / Math.E ** (x ** 2 + y ** 2)
    // let value = 1 ** 2 < x ** 2 - y ** 2 + z ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2;
    // let value = z + 2 > x ** 2 + y ** 2;
    // let value = z < Math.sin(x + y) / 2 + Math.sin(x - y) / 5;

    // let value = 0 < (x ** 2 + 9 / 4 * y ** 2 + z ** 2 - 1) ** 3 - (x ** 2 + 9 / 80 * y ** 2) * z ** 3 - 0;

    let value = z < Math.E ** -(x ** 2 + y ** 2)*1.5

    memory.set(`${x}|${y}|${z}`, value);
    return value;
}