//@ts-check
'use strict';

/**
 * @param {number} frameSize
 * @param {number} blockSize
 * @param {Expression} equation
 */
function plotGraph(frameSize, blockSize, equation) {

    let memory = new Map();

    let bigBlockSize = blockSize * 2;

    let bigBlocks = [];

    for (let x = -frameSize; x < frameSize; x += bigBlockSize) {
        for (let y = -frameSize; y < frameSize; y += bigBlockSize) {
            for (let z = -frameSize; z < frameSize; z += bigBlockSize) {

                if (checkBlock(equation, x, y, z, bigBlockSize, memory)) {
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

                    if (checkBlock(equation, x, y, z, blockSize, memory)) {
                        blocks.push(new Vector3(x, y, z));
                        continue;
                    }
                }
            }
        }
    });



    let graphObjs = [];
    let totalPoints = 0;

    blocks.forEach((block) => {

        let sides = [
            calcPlane(equation, new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(equation, new Vector3(block.x + blockSize, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(equation, new Vector3(block.x, block.y, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),
            calcPlane(equation, new Vector3(block.x, block.y + blockSize, block.z), new Vector3(blockSize, 0, 0), new Vector3(0, 0, blockSize), memory),

            calcPlane(equation, new Vector3(block.x, block.y, block.z), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
            calcPlane(equation, new Vector3(block.x, block.y, block.z + blockSize), new Vector3(0, blockSize, 0), new Vector3(blockSize, 0, 0), memory),
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


        if (points.length >= 3) {
            graphObjs = graphObjs.concat(new Polygon3(points));
            totalPoints += points.length;
        }
    });

    console.log(totalPoints);

    return graphObjs;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} blockSize
 * @param {Map<any, any>} memory
 */
function checkBlock(equation, x, y, z, blockSize, memory) {

    if ((calcPoint(equation, x, y, z, memory) != calcPoint(equation, x + blockSize, y, z, memory))) { return true; }
    if ((calcPoint(equation, x, y + blockSize, z, memory) != calcPoint(equation, x + blockSize, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(equation, x, y, z + blockSize, memory) != calcPoint(equation, x + blockSize, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(equation, x, y + blockSize, z + blockSize, memory) != calcPoint(equation, x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }

    if ((calcPoint(equation, x, y, z, memory) != calcPoint(equation, x, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(equation, x + blockSize, y, z, memory) != calcPoint(equation, x + blockSize, y + blockSize, z, memory))) { return true; }
    if ((calcPoint(equation, x, y, z + blockSize, memory) != calcPoint(equation, x, y + blockSize, z + blockSize, memory))) { return true; }
    if ((calcPoint(equation, x + blockSize, y, z + blockSize, memory) != calcPoint(equation, x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }

    if ((calcPoint(equation, x, y, z, memory) != calcPoint(equation, x, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(equation, x + blockSize, y, z, memory) != calcPoint(equation, x + blockSize, y, z + blockSize, memory))) { return true; }
    if ((calcPoint(equation, x, y + blockSize, z, memory) != calcPoint(equation, x, y + blockSize, z + blockSize, memory))) { return true; }
    if ((calcPoint(equation, x + blockSize, y + blockSize, z, memory) != calcPoint(equation, x + blockSize, y + blockSize, z + blockSize, memory))) { return true; }
}

/**
 * @param {Vector3} v1
 * @param {Vector3} v2
 * @param {Vector3} v3
 * @param {Map<any, any>} memory
 */
function calcPlane(equation, v1, v2, v3, memory) {

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}||${v3.x}|${v3.y}|${v3.z}`)) {
        return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}||${v3.x}|${v3.y}|${v3.z}`);
    }


    let points = []

    if (points.length < 2) {
        let point = calcLine(equation, v1, v2, memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(equation, v1.plus(v3), v2, memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(equation, v1, v3, memory)
        if (point != null) { points.push(point); }
    }

    if (points.length < 2) {
        let point = calcLine(equation, v1.plus(v2), v3, memory)
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
function calcLine(equation, v1, v2, memory) {

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`)) {
        return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`);
    }

    let hit = calcLineRecur(equation, v1, v2, memory, 0.1);

    memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, hit);
    return hit;
}

/**
 * @param {Vector3} v1
 * @param {Vector3} v2
 * @param {Map<any, any>} memory
 * @param {number} detail
 */
function calcLineRecur(equation, v1, v2, memory, detail) {

    if (memory.has(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`)) {
        return memory.get(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`);
    }

    let calc1 = calcPoint(equation, v1.x, v1.y, v1.z, memory);
    let calc2 = calcPoint(equation, v1.plus(v2).x, v1.plus(v2).y, v1.plus(v2).z, memory);


    if (calc1 == calc2) {
        memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, null);
        return null;
    }

    let halfDiff = v2.timesScalar(0.5);

    if (halfDiff.magnitude2() < detail ** 2) {
        let hit = v1.plus(halfDiff);
        memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, hit);
        return hit;
    }


    let hit = calcLineRecur(equation, v1, halfDiff, memory, detail);
    if (hit == null) { hit = calcLineRecur(equation, v1.plus(halfDiff), halfDiff, memory, detail); }

    memory.set(`${v1.x}|${v1.y}|${v1.z}||${v2.x}|${v2.y}|${v2.z}`, hit);
    return hit;
}


/**
 * @param {Expression} equation
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {Map} memory
 */
function calcPoint(equation, x, y, z, memory) {

    x = x / 125 + 0;
    y = y / 125 + 0;
    z = z / 125 + 0;

    if (memory.has(`${x}|${y}|${z}`)) { return memory.get(`${x}|${y}|${z}`); }


    // let value = 1 > (x / 1.5) ** 8 + (y / 1) ** 2 + (z / 1) ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2 - 0.5 ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2 + 0.5 ** 2;
    // let value = 0.5 > (Math.sqrt(x ** 2 + y ** 2) - 1.25) ** 2 + z ** 2;
    // let value = z > 7 * (x * y) / Math.E ** (x ** 2 + y ** 2);
    // let value = 1 ** 2 < x ** 2 - y ** 2 + z ** 2;
    // let value = z ** 2 > x ** 2 + y ** 2;
    // let value = z + 0.5 > x ** 2 + y ** 2;
    // let value = z * 5 < Math.sin(x * 1.5 + y * 1.5) + Math.sin(x * 1.5 - y * 1.5);
    // let value = 0 < (x ** 2 + 9 / 4 * y ** 2 + z ** 2 - 1) ** 3 - (x ** 2 + 9 / 80 * y ** 2) * z ** 3 - 0;
    // let value = z < Math.E ** -(x ** 2 + y ** 2) * 1.5;
    // let value = 1 < (Math.cos(x) ** 2 + Math.cos(y) ** 2 + Math.cos(z) ** 2)**0.5;
    // let value = 0 < (x ** 4 + y ** 4 + z ** 4 - 1 ** 4) ** (1 / 4) - 0 ** 1;
    // let value = 0 < x ** 2 - y ** 2 + z ** 2 - 1.001 ** 2;
    // let value = x < 0;


    // memory.set(`${x}|${y}|${z}`, value);
    // return value;




    let result = null;
    let resultStr = equation.substVariables(x, y, z).solve().toStrings();
    if (resultStr == 'true') result = true;
    if (resultStr == 'false') result = false;

    memory.set(`${x}|${y}|${z}`, result);
    return result;
}
