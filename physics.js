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

    /** @param {Vector2} vector2 */
    plus(vector2) { return new Vector2(this.x + vector2.x, this.y + vector2.y); }

    /** @param {Vector2} vector2 */
    minus(vector2) { return new Vector2(this.x - vector2.x, this.y - vector2.y); }

    /** @param {Vector2} vector2 */
    times(vector2) { return new Vector2(this.x * vector2.x - this.y * vector2.y, this.x * vector2.y + this.y * vector2.x); }

    /** @param {Vector2} vector2 */
    over(vector2) { return this.times(vector2.conjugate()).times(new Vector2(1 / vector2.magnitude2(), 0)); }

    /** @param {number} zoom */
    draw(zoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        let x1 = this.x * 10 ** (zoom / 10) + canvas.width / 2;
        let y1 = -this.y * 10 ** (zoom / 10) + canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * @param {Vector3} vector3
     * @param {number} zoom
     * @param {number} yaw
     * @param {number} pitch
     */
    static projectFrom3d(vector3, zoom, yaw, pitch) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let x1 = vector3.x * Math.cos(yaw) - vector3.y * Math.sin(yaw);
        let y1 = vector3.y * Math.cos(yaw) + vector3.x * Math.sin(yaw);
        let z1 = vector3.z;

        let x2 = x1;
        let y2 = y1 * Math.cos(pitch) + z1 * Math.sin(pitch);
        let z2 = z1 * Math.cos(pitch) - y1 * Math.sin(pitch);

        let x3 = (x2 / Math.max(y2 + 1000 / 10 ** (zoom / 10), 0) * 1000) + canvas.width / 2;
        let y3 = -(z2 / Math.max(y2 + 1000 / 10 ** (zoom / 10), 0) * 1000) + canvas.height / 2;

        return new Vector2(x3, y3);
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

    magnitude2() { return this.x ** 2 + this.y ** 2 + this.z ** 2; }
    magnitude() { return Math.sqrt(this.magnitude2()); }
    unit() { return new Vector3(this.x / this.magnitude(), this.y / this.magnitude(), this.z / this.magnitude()); }
    conjugate() { return new Vector3(this.x, -this.y, -this.z); }

    xy() { return new Vector2(this.x, this.y); }
    xz() { return new Vector2(this.x, this.z); }
    yz() { return new Vector2(this.y, this.z); }

    /** @param {Vector3} vector3 */
    plus(vector3) { return new Vector3(this.x + vector3.x, this.y + vector3.y, this.z + vector3.z); }

    /** @param {Vector3} vector3 */
    minus(vector3) { return new Vector3(this.x - vector3.x, this.y - vector3.y, this.z - vector3.z); }

    /** @param {number} number */
    times(number) { return new Vector3(this.x * number, this.y * number, this.z * number); }

    /** @param {number} number */
    over(number) { return new Vector3(this.x / number, this.y / number, this.z / number); }

    /** @param {Vector2} xy */
    timesXY(xy) {
        let x1 = this.x * xy.x - this.y * xy.y;
        let y1 = this.x * xy.y + this.y * xy.x;
        let z1 = this.z;

        return new Vector3(x1, y1, z1);
    }

    /** @param {Vector2} xz */
    timesXZ(xz) {
        let x1 = this.x * xz.x - this.z * xz.y;
        let y1 = this.y;
        let z1 = this.x * xz.y + this.z * xz.x;

        return new Vector3(x1, y1, z1);
    }

    /** @param {Vector2} yz */
    timesYZ(yz) {
        let x1 = this.x;
        let y1 = this.y * yz.x - this.z * yz.y;
        let z1 = this.y * yz.y + this.z * yz.x;

        return new Vector3(x1, y1, z1);
    }

    /**
     * @param {Vector3} a
     * @param {Vector3} b
     */
    timesPlane(a, b) {

        let yaw = a.xy().unit();
        let pitch = a.timesXY(yaw.conjugate()).xz().unit();

        let b1 = b.timesXY(yaw.conjugate());
        let b2 = b1.timesXZ(pitch.conjugate());
        let roll = b2.yz().unit();

        let p1 = this.timesYZ(roll);
        let p2 = p1.timesXZ(pitch);
        let p3 = p2.timesXY(yaw);

        return p3.times(a.magnitude());
    }

    /**
     * @param {Vector3} a
     * @param {Vector3} b
     */
    overPlane(a, b) {

        let yaw = a.xy().unit();
        let pitch = a.timesXY(yaw.conjugate()).xz().unit();

        let b1 = b.timesXY(yaw.conjugate());
        let b2 = b1.timesXZ(pitch.conjugate());
        let roll = b2.yz().unit();

        let p1 = this.timesXY(yaw.conjugate());
        let p2 = p1.timesXZ(pitch.conjugate());
        let p3 = p2.timesYZ(roll.conjugate());

        return p3.over(a.magnitude());
    }

    /**
     * @param {number} zoom
     * @param {number} yaw
     * @param {number} pitch
     */
    draw(zoom, yaw, pitch) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        let v2 = Vector2.projectFrom3d(this, zoom, yaw, pitch);

        ctx.beginPath();
        ctx.arc(v2.x, v2.y, 4, 0, Math.PI * 2);
        ctx.stroke();
    }
}