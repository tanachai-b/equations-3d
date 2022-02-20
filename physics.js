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

    angle() { return Math.atan2(this.y, this.x); }

    /** @param {Vector2} vector2 */
    plus(vector2) { return new Vector2(this.x + vector2.x, this.y + vector2.y); }

    /** @param {Vector2} vector2 */
    minus(vector2) { return new Vector2(this.x - vector2.x, this.y - vector2.y); }

    /** @param {Vector2} vector2 */
    times(vector2) { return new Vector2(this.x * vector2.x - this.y * vector2.y, this.x * vector2.y + this.y * vector2.x); }

    /** @param {Vector2} vector2 */
    over(vector2) { return this.times(vector2.conjugate()).times(new Vector2(1 / vector2.magnitude2(), 0)); }

    /**
     * @param {number} magnitude
     * @param {number} angle
     */
    static polar(magnitude, angle) { return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle)); }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    draw(camRot, camZoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#888888';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        let x1 = this.x * 10 ** (camZoom / 10) + canvas.width / 2;
        let y1 = -this.y * 10 ** (camZoom / 10) + canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x1, y1, 1 * 10 ** (camZoom / 10), 0, Math.PI * 2);
        ctx.fill();
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
    timesScalar(number) { return new Vector3(this.x * number, this.y * number, this.z * number); }

    /** @param {number} number */
    overScalar(number) { return new Vector3(this.x / number, this.y / number, this.z / number); }

    /** @param {Vector2} vector2 */
    timesXY(vector2) {
        let x1 = this.x * vector2.x - this.y * vector2.y;
        let y1 = this.x * vector2.y + this.y * vector2.x;
        let z1 = this.z;

        return new Vector3(x1, y1, z1);
    }

    /** @param {Vector2} vector2 */
    timesXZ(vector2) {
        let x1 = this.x * vector2.x - this.z * vector2.y;
        let y1 = this.y;
        let z1 = this.x * vector2.y + this.z * vector2.x;

        return new Vector3(x1, y1, z1);
    }

    /** @param {Vector2} vector2 */
    timesYZ(vector2) {
        let x1 = this.x;
        let y1 = this.y * vector2.x - this.z * vector2.y;
        let z1 = this.y * vector2.y + this.z * vector2.x;

        return new Vector3(x1, y1, z1);
    }

    /**
     * @param {Vector3} vector3
     */
    times(vector3) {

        let yaw = vector3.xy().unit();
        let pitch = vector3.timesXY(yaw.conjugate()).xz();

        /** @type {Vector3} */
        let v1 = this.timesXZ(pitch);
        let v2 = v1.timesXY(yaw);

        return v2;
    }

    /**
     * @param {Vector3} vector3
     */
    over(vector3) {

        let yaw = vector3.xy().unit();
        let pitch = vector3.timesXY(yaw.conjugate()).xz();

        let v1 = this.timesXY(yaw.conjugate());
        let v2 = v1.timesXZ(pitch.conjugate());

        return v2.overScalar(vector3.magnitude2());
    }

    /**
     * @param {Line} line
     */
    timesLine(line) {

        let yaw = line.v.xy().unit();
        let pitch = line.v.timesXY(yaw.conjugate()).xz();

        let w1 = line.w.timesXY(yaw.conjugate());
        let w2 = w1.timesXZ(pitch.conjugate());
        let roll = w2.yz().unit();

        let v1 = this.timesYZ(roll);
        let v2 = v1.timesXZ(pitch);
        let v3 = v2.timesXY(yaw);

        return v3;
    }

    /**
     * @param {Line} line
     */
    overLine(line) {

        let yaw = line.v.xy().unit();
        let pitch = line.v.timesXY(yaw.conjugate()).xz();

        let w1 = line.w.timesXY(yaw.conjugate());
        let w2 = w1.timesXZ(pitch.conjugate());
        let roll = w2.yz().unit();

        let v1 = this.timesXY(yaw.conjugate());
        let v2 = v1.timesXZ(pitch.conjugate());
        let v3 = v2.timesYZ(roll.conjugate());

        return v3.overScalar(line.v.magnitude2());
    }

    /**
     * @param {number} magnitude
     * @param {number} yaw
     * @param {number} pitch
     */
    static polar(magnitude, yaw, pitch) {
        let v1 = new Vector3(magnitude, 0, 0).timesXZ(Vector2.polar(1, pitch));
        return v1.timesXY(Vector2.polar(1, yaw));
    }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    draw(camRot, camZoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#888888';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        let v1 = this.project(camRot, camZoom);

        let v1r = this.timesLine(camRot);
        let rad = 1 / Math.max(v1r.y + 1000 / 10 ** (camZoom / 10), 0) * 1000;

        ctx.beginPath();
        ctx.arc(v1.x, v1.y, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    project(camRot, camZoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let v1 = this.timesLine(camRot);

        let x1 = (v1.x / Math.max(v1.y + 1000 / 10 ** (camZoom / 10), 0) * 1000) + canvas.width / 2;
        let y1 = -(v1.z / Math.max(v1.y + 1000 / 10 ** (camZoom / 10), 0) * 1000) + canvas.height / 2;

        return new Vector2(x1, y1);
    }
}

class Line {
    /**
     * @param {Vector3} v
     * @param {Vector3} w
     */
    constructor(v, w) {
        this.v = v;
        this.w = w;
    }

    static standard() { return new Line(new Vector3(1, 0, 0), new Vector3(0, 1, 0)); }

    magnitude2() { return this.v.magnitude2(); }
    magnitude() { return this.v.magnitude(); }
    unit() { return new Line(this.v.unit(), this.w.unit()); }

    /** @param {Vector2} vector2 */
    timesXY(vector2) { return new Line(this.v.timesXY(vector2), this.w.timesXY(vector2)); }

    /** @param {Vector2} vector2 */
    timesXZ(vector2) { return new Line(this.v.timesXZ(vector2), this.w.timesXZ(vector2)); }

    /** @param {Vector2} vector2 */
    timesYZ(vector2) { return new Line(this.v.timesYZ(vector2), this.w.timesYZ(vector2)); }

    /** @param {Line} line */
    timesLine(line) { return new Line(this.v.timesLine(line), this.w.timesLine(line)); }

    /** @param {Line} line */
    overLine(line) { return new Line(this.v.overLine(line), this.w.overLine(line)); }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    draw(camRot, camZoom) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#888888';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        let v1 = this.v.project(camRot, camZoom);
        let w1 = this.w.project(camRot, camZoom);

        let v1r = this.v.timesLine(camRot);
        let vrad = 1 / Math.max(v1r.y + 1000 / 10 ** (camZoom / 10), 0) * 1000;

        let w1r = this.w.timesLine(camRot);
        let wrad = 1 / Math.max(w1r.y + 1000 / 10 ** (camZoom / 10), 0) * 1000;

        // ctx.beginPath();
        // ctx.arc(v1.x, v1.y, vrad, 0, Math.PI * 2);
        // ctx.fill();

        // ctx.beginPath();
        // ctx.arc(w1.x, w1.y, wrad, 0, Math.PI * 2);
        // ctx.fill();

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(w1.x, w1.y);
        ctx.stroke();
    }
}