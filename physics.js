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
    project(camRot, camZoom) {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let x1 = this.x * 10 ** (camZoom / 10) + canvas.width / 2;
        let y1 = -this.y * 10 ** (camZoom / 10) + canvas.height / 2;

        return new Vector2(x1, y1);
    }

    depth() { return 0; }

    draw() {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#888888';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
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
        if (line.v.xy().magnitude2() == 0) { yaw = new Vector2(1, 0); }

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
    project(camRot, camZoom) {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let v1 = this.timesLine(camRot);

        let z1 = Math.max(v1.y + 1000 / 10 ** (camZoom / 10), 0);
        let x1 = v1.x / z1 * 1000 + canvas.width / 2;
        let y1 = -v1.z / z1 * 1000 + canvas.height / 2;

        return new Vector2(x1, y1);
    }

    /**
     * @param {Line} [camRot]
     * @param {number} [camZoom]
     */
    depth(camRot, camZoom) {
        let v1 = this.timesLine(camRot);
        let z1 = Math.max(v1.y + 1000 / 10 ** (camZoom / 10), 0);
        return z1;
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


        let v1 = this.timesLine(camRot);

        let z1 = Math.max(v1.y + 1000 / 10 ** (camZoom / 10), 0);
        let x1 = v1.x / z1 * 1000 + canvas.width / 2;
        let y1 = -v1.z / z1 * 1000 + canvas.height / 2;


        let rad = 1 / this.z * 1000;


        ctx.beginPath();
        ctx.arc(x1, y1, rad, 0, Math.PI * 2);
        ctx.fill();
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
    depth(camRot, camZoom) { return (this.v.depth(camRot, camZoom) + this.w.depth(camRot, camZoom)) / 2; }

    /**
     * @param {Line} camRot
     * @param {any} camZoom
     */
    draw(camRot, camZoom) {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#00000044';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        let v1 = this.v.project(camRot, camZoom);
        let w1 = this.w.project(camRot, camZoom);

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(w1.x, w1.y);
        ctx.stroke();
    }
}


class Plane {
    /**
     * @param {Vector3} u
     * @param {Vector3} v
     * @param {Vector3} w
     */
    constructor(u, v, w) {
        this.u = u;
        this.v = v;
        this.w = w;
    }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    depth(camRot, camZoom) {
        return (
            this.u.depth(camRot, camZoom) +
            this.v.depth(camRot, camZoom) +
            this.w.depth(camRot, camZoom)
        ) / 3;
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
        ctx.strokeStyle = '#88AAEE';
        ctx.fillStyle = '#CCDDFFCC';
        ctx.lineWidth = 1;

        let u1 = this.u.project(camRot, camZoom);
        let v1 = this.v.project(camRot, camZoom);
        let w1 = this.w.project(camRot, camZoom);

        ctx.beginPath();
        ctx.moveTo(u1.x, u1.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(w1.x, w1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}


class Polygon2 {

    /**
     * @param {Vector3[]} points
     * @param {boolean} [sort]
     */
    constructor(points, sort = true) {

        if (points.length == 3) { this.points = points; return; }
        if (!sort) { this.points = points; return; }

        let axisLine = new Line(points[1].minus(points[0]).unit(), points[2].minus(points[0]));

        let sortable = [];
        points.forEach((point, index) => {
            if (index == 0) {
                sortable.push([-Number.MAX_SAFE_INTEGER, point]);
            } else {
                let flatten = point.minus(points[0]).overLine(axisLine);
                sortable.push([flatten.xy().angle(), point]);
            }
        });
        sortable.sort((a, b) => { return b[0] - a[0]; });

        let sorted = [];
        sortable.forEach(sorting => { sorted.push(sorting[1]); });
        this.points = sorted;
    }

    /**
     * @param {Line} camRot
     * @param {number} camZoom
     */
    depth(camRot, camZoom) {
        let sum = 0;
        this.points.forEach((point) => { sum += point.depth(camRot, camZoom) });
        return sum / this.points.length;
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
        ctx.strokeStyle = '#88AAEE44';
        ctx.fillStyle = '#CCDDFFCC';
        ctx.lineWidth = 1;


        let diffusePerc = 0;
        let specPerc = 0;

        this.shade(camRot, (cameraAngle, lightAngle, specAngle) => {

            diffusePerc = (Math.PI / 2 - Math.min(lightAngle, Math.PI / 2)) / (Math.PI / 2);
            specPerc = (Math.PI / 6 - Math.min(specAngle, Math.PI / 6)) / (Math.PI / 6);
        });

        let rAmbient = 128;
        let gAmbient = 160;
        let bAmbient = 224;

        let rDiffuse = 204;
        let gDiffuse = 221;
        let bDiffuse = 255;

        let rDec = (1 - specPerc) * (diffusePerc * (rDiffuse - rAmbient) + rAmbient) + (specPerc * 255);
        let gDec = (1 - specPerc) * (diffusePerc * (gDiffuse - gAmbient) + gAmbient) + (specPerc * 255);
        let bDec = (1 - specPerc) * (diffusePerc * (bDiffuse - bAmbient) + bAmbient) + (specPerc * 255);

        let rHex = Math.floor(rDec).toString(16).padStart(2, '0');
        let gHex = Math.floor(gDec).toString(16).padStart(2, '0');
        let bHex = Math.floor(bDec).toString(16).padStart(2, '0');

        ctx.fillStyle = `#${rHex}${gHex}${bHex}CC`;


        let projected = []
        this.points.forEach((point) => { projected.push(point.project(camRot, camZoom)); });

        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        for (let i = 2; i < projected.length; i++) { ctx.lineTo(projected[i].x, projected[i].y); }
        ctx.closePath();
        ctx.fill();
        // ctx.stroke();
    }

    /**
     * @param {Line} camRot
     * @param {{ (cameraAngle: number, lightAngle: number, specAngle:number): void; }} callBack
     */
    shade(camRot, callBack) {
        let rotated = [];
        this.points.forEach((point) => { rotated.push(point.timesLine(camRot)); });


        let normalSum = new Vector3(0, 0, 0);

        for (let i = 2; i < rotated.length; i++) {
            let vecNormal = new Vector3(0, 0, 1).timesLine(new Line(rotated[i - 1].minus(rotated[0]).unit(), rotated[i].minus(rotated[0])));
            if (vecNormal.y > 0) vecNormal = vecNormal.timesScalar(-1);

            normalSum = normalSum.plus(vecNormal);
        }

        let avgNormal = normalSum.overScalar(rotated.length - 2).unit();


        let cameraAngle = Math.PI / 2 + avgNormal.timesXZ(avgNormal.xz().conjugate().unit()).xy().angle();

        let vecLight = new Vector3(0, -1, 0);//.timesLine(camRot);
        let vecBB = avgNormal.over(vecLight.unit());
        let lightAngle = vecBB.timesYZ(vecBB.yz().conjugate().unit()).xy().angle();

        let vecSup = new Vector3(-1, -2, 1);//.timesLine(camRot);
        let vecAA = avgNormal.over(vecSup.unit());
        let specAngle = vecAA.timesYZ(vecAA.yz().conjugate().unit()).xy().angle();

        callBack(cameraAngle, lightAngle, specAngle);
    }
}