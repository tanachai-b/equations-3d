//@ts-check
'use strict';


class Vector2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    magnitude2() { return this.x ** 2 + this.y ** 2 }

    magnitude() { return Math.sqrt(this.magnitude2()); }

    unit() { return new Vector2(this.x / this.magnitude(), this.y / this.magnitude()); }

    conjugate() { return new Vector2(this.x, -this.y); }

    /**
     * @param {Vector2} vector2
     */
    plus(vector2) { return new Vector2(this.x + vector2.x, this.y + vector2.y); }

    /**
     * @param {Vector2} vector2
     */
    minus(vector2) { return new Vector2(this.x - vector2.x, this.y - vector2.y); }

    /**
     * @param {Vector2} vector2
     */
    times(vector2) { return new Vector2(this.x * vector2.x - this.y * vector2.y, this.x * vector2.y + this.y * vector2.x); }

    /**
     * @param {Vector2} vector2
     */
    over(vector2) { return this.times(vector2.conjugate()).times(new Vector2(1 / vector2.magnitude() ** 2, 0)); }

    /**
     * @param {number} zoom
     */
    draw(zoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        let x1 = this.x * zoom + canvas.width / 2;
        let y1 = -this.y * zoom + canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * @param {Vector3} vector3
     */
    static projectFrom3d(vector3) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let x1 = (vector3.x / Math.max(vector3.y + 1000) * 1000) + canvas.width / 2;
        let y1 = -(vector3.z / Math.max(vector3.y + 1000) * 1000) + canvas.height / 2;

        return new Vector2(x1, y1);
    }
}

class Vector3 {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude() { return Math.hypot(this.x, this.y, this.z); }

    unit() { return this.over(this.magnitude()); }

    conjugate() { return new Vector3(this.x, -this.y, -this.x); }

    /**
     * @param {Vector3} vector
     */
    plus(vector) { return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z); }

    /**
     * @param {Vector3} vector
     */
    minus(vector) { return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z); }

    /**
     * @param {number} number
     */
    times(number) { return new Vector3(this.x * number, this.y * number, this.z * number); }

    /**
     * @param {number} number
     */
    over(number) { return new Vector3(this.x / number, this.y / number, this.z / number); }

    /**
     * @param {Vector3} pointA
     * @param {Vector3} pointB
     */
    timesVector(pointA, pointB) {

        let yaw = Math.atan2(pointA.y, pointA.x);
        let pitch = Math.atan2(pointA.z, Math.hypot(pointA.x, pointA.y));


        let x3 = pointB.x * Math.cos(-yaw) - pointB.y * Math.sin(-yaw);
        let y3 = pointB.y * Math.cos(-yaw) + pointB.x * Math.sin(-yaw);
        let z3 = pointB.z;

        let x4 = x3 * Math.cos(-pitch) - z3 * Math.sin(-pitch);
        let y4 = y3;
        let z4 = z3 * Math.cos(-pitch) + x3 * Math.sin(-pitch);

        let roll = Math.atan2(z4, y4);


        let xx1 = this.x;
        let yy1 = this.y * Math.cos(roll) - this.z * Math.sin(roll);
        let zz1 = this.z * Math.cos(roll) + this.y * Math.sin(roll);

        let xx2 = xx1 * Math.cos(pitch) - zz1 * Math.sin(pitch);
        let yy2 = yy1;
        let zz2 = zz1 * Math.cos(pitch) + xx1 * Math.sin(pitch);

        let xx3 = xx2 * Math.cos(yaw) - yy2 * Math.sin(yaw);
        let yy3 = yy2 * Math.cos(yaw) + xx2 * Math.sin(yaw);
        let zz3 = zz2;

        return new Vector3(xx3, yy3, zz3).times(pointA.magnitude());
    }

    /**
     * @param {Vector3} pointA
     * @param {Vector3} pointB
     */
    overVector(pointA, pointB) {

        let yaw = Math.atan2(pointA.y, pointA.x);
        let pitch = Math.atan2(pointA.z, Math.hypot(pointA.x, pointA.y));


        let x3 = pointB.x * Math.cos(-yaw) - pointB.y * Math.sin(-yaw);
        let y3 = pointB.y * Math.cos(-yaw) + pointB.x * Math.sin(-yaw);
        let z3 = pointB.z;

        let x4 = x3 * Math.cos(-pitch) - z3 * Math.sin(-pitch);
        let y4 = y3;
        let z4 = z3 * Math.cos(-pitch) + x3 * Math.sin(-pitch);

        let roll = Math.atan2(z4, y4);


        let xx1 = this.x * Math.cos(-yaw) - this.y * Math.sin(-yaw);
        let yy1 = this.y * Math.cos(-yaw) + this.x * Math.sin(-yaw);
        let zz1 = this.z;

        let xx2 = xx1 * Math.cos(-pitch) - zz1 * Math.sin(-pitch);
        let yy2 = yy1;
        let zz2 = zz1 * Math.cos(-pitch) + xx1 * Math.sin(-pitch);

        let xx3 = xx2;
        let yy3 = yy2 * Math.cos(-roll) - zz2 * Math.sin(-roll);
        let zz3 = zz2 * Math.cos(-roll) + yy2 * Math.sin(-roll);

        return new Vector3(xx3, yy3, zz3).over(pointA.magnitude());
    }
}