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
    unit() {
        if (this.magnitude2() == 0) {
            return new Vector2(1, 0);
        } else {
            return new Vector2(this.x / this.magnitude(), this.y / this.magnitude());
        }
    }
    conjugate() { return new Vector2(this.x, -this.y); }

    angle() { return Math.atan2(this.y, this.x); }

    /** @param {Vector2} vector2 */
    plus(vector2) { return new Vector2(this.x + vector2.x, this.y + vector2.y); }

    /** @param {Vector2} vector2 */
    minus(vector2) { return new Vector2(this.x - vector2.x, this.y - vector2.y); }

    /** @param {number} number */
    timesScalar(number) { return new Vector2(this.x * number, this.y * number); }

    /** @param {number} number */
    overScalar(number) { return new Vector2(this.x / number, this.y / number); }

    /** @param {Vector2} vector2 */
    times(vector2) { return new Vector2(this.x * vector2.x - this.y * vector2.y, this.x * vector2.y + this.y * vector2.x); }

    /** @param {Vector2} vector2 */
    over(vector2) { return this.times(vector2.conjugate()).timesScalar(1 / vector2.magnitude2()); }

    /**
     * @param {number} magnitude
     * @param {number} angle
     */
    static polar(magnitude, angle) { return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle)); }

    /** @param {Camera} camera */
    project(camera) {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let x1 = this.x * 10 ** (camera.zoom / 10) + canvas.width / 2;
        let y1 = -this.y * 10 ** (camera.zoom / 10) + canvas.height / 2;

        // return new Vector2(x1, y1);
        return new Vector2(x1 + 0.5 | 0, y1 + 0.5 | 0);
    }

    depth() { return 0; }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
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
    unit() {
        if (this.magnitude2() == 0) {
            return new Vector3(1, 0, 0);
        } else {
            return new Vector3(this.x / this.magnitude(), this.y / this.magnitude(), this.z / this.magnitude());
        }
    }
    conjugate() { return new Vector3(this.x, -this.y, -this.z); }

    yaw() { return this.xy().unit(); }
    pitch() { return new Vector2(this.xy().magnitude(), this.z).unit(); }

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

    /** @param {Vector3} vector3 */
    times(vector3) {
        let v1 = this.timesXZ(vector3.pitch());
        let v2 = v1.timesXY(vector3.yaw());

        return v2.timesScalar(vector3.magnitude());
    }

    /** @param {Vector3} vector3 */
    over(vector3) {
        let v1 = this.timesXY(vector3.yaw().conjugate());
        let v2 = v1.timesXZ(vector3.pitch().conjugate());

        return v2.overScalar(vector3.magnitude());
    }

    /** @param {Line} line */
    timesLine(line) {
        let result = new Vector3(1, 0, 0);

        line.angles((yaw, pitch, roll) => {
            let v1 = this.timesYZ(roll);
            let v2 = v1.timesXZ(pitch);
            let v3 = v2.timesXY(yaw);
            result = v3.timesScalar(line.v.magnitude());
        });

        return result;
    }

    /** @param {Line} line */
    overLine(line) {
        let result = new Vector3(1, 0, 0);

        line.angles((yaw, pitch, roll) => {
            let v1 = this.timesXY(yaw.conjugate());
            let v2 = v1.timesXZ(pitch.conjugate());
            let v3 = v2.timesYZ(roll.conjugate());
            result = v3.overScalar(line.v.magnitude());
        });

        return result;
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

    /** @param {Camera} camera */
    project(camera) {
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');

        let v1 = this.timesLine(camera.rotation);
        let z1 = Math.max(-v1.z + 1000 / 10 ** (camera.zoom / 10), 0);

        let x1 = v1.x / z1 * 1000 + canvas.width / 2;
        let y1 = -v1.y / z1 * 1000 + canvas.height / 2;

        // return new Vector2(x1, y1);
        return new Vector2(x1 + 0.5 | 0, y1 + 0.5 | 0);
    }

    /** @param {Camera} camera */
    depth(camera) {
        let v1 = this.timesLine(camera.rotation);
        let z1 = Math.max(-v1.z + 1000 / 10 ** (camera.zoom / 10), 0);
        return z1;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#888888';
        ctx.fillStyle = '#888888';
        ctx.lineWidth = 1;

        let vp = this.project(camera);

        let v1 = this.timesLine(camera.rotation);
        let z1 = Math.max(-v1.z + 1000 / 10 ** (camera.zoom / 10), 0);
        let rad = 1 / z1 * 1000;

        ctx.beginPath();
        ctx.arc(vp.x, vp.y, rad, 0, Math.PI * 2);
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

    static default() { return new Line(new Vector3(1, 0, 0), new Vector3(0, 1, 0)); }

    magnitude2() { return this.v.magnitude2(); }
    magnitude() { return this.v.magnitude(); }
    unit() { return new Line(this.v.unit(), this.w.unit()); }

    /** @param {(yaw: Vector2, pitch: Vector2, roll: Vector2) => void} callBack */
    angles(callBack) {
        let yaw = this.v.yaw();
        let pitch = this.v.pitch();

        let w1 = this.w.timesXY(yaw.conjugate());
        w1 = w1.timesXZ(pitch.conjugate());
        let roll = w1.yz().unit();

        callBack(yaw, pitch, roll);
    }

    /** @param {Vector2} vector2 */
    timesXY(vector2) { return new Line(this.v.timesXY(vector2), this.w.timesXY(vector2)); }

    /** @param {Vector2} vector2 */
    timesXZ(vector2) { return new Line(this.v.timesXZ(vector2), this.w.timesXZ(vector2)); }

    /** @param {Vector2} vector2 */
    timesYZ(vector2) { return new Line(this.v.timesYZ(vector2), this.w.timesYZ(vector2)); }

    /** @param {Vector3} vector3 */
    times(vector3) { return new Line(this.v.times(vector3), this.w.times(vector3)); }

    /** @param {Vector3} vector3 */
    over(vector3) { return new Line(this.v.over(vector3), this.w.over(vector3)); }

    /** @param {Line} line */
    timesLine(line) { return new Line(this.v.timesLine(line), this.w.timesLine(line)); }

    /** @param {Line} line */
    overLine(line) { return new Line(this.v.overLine(line), this.w.overLine(line)); }

    /** @param {Camera} camera */
    depth(camera) { return (this.v.depth(camera) + this.w.depth(camera)) / 2; }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#00000022';
        ctx.fillStyle = '#00000022';
        ctx.lineWidth = 1;

        let v1 = this.v.project(camera);
        let w1 = this.w.project(camera);

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

    /** @param {Camera} camera */
    depth(camera) {
        return (
            this.u.depth(camera) +
            this.v.depth(camera) +
            this.w.depth(camera)
        ) / 3;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#88AAEE';
        ctx.fillStyle = '#CCDDFFCC';
        ctx.lineWidth = 1;

        let u1 = this.u.project(camera);
        let v1 = this.v.project(camera);
        let w1 = this.w.project(camera);

        ctx.beginPath();
        ctx.moveTo(u1.x, u1.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(w1.x, w1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Polygon3 {

    /**
     * @param {Vector3[]} points
     * @param {boolean} [sort]
     */
    constructor(points, sort = true) {

        if (points.length == 3) { this.points = points; return; }
        if (!sort) { this.points = points; return; }

        let axisLine = new Line(points[1].minus(points[0]), points[2].minus(points[0]));

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

    /** @param {Camera} camera */
    depth(camera) {
        let sum = 0;
        this.points.forEach((point) => { sum += point.depth(camera) });
        return sum / this.points.length;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#FFFFFF22';
        ctx.fillStyle = '#CCDDFFCC';
        ctx.lineWidth = 1;


        let rotated = [];
        this.points.forEach((point) => { rotated.push(point.timesLine(camera.rotation)); });

        let rAvg = 0;
        let gAvg = 0;
        let bAvg = 0;

        let totalArea = 0;

        for (let i = 2; i < rotated.length; i++) {

            let normal = new Vector3(0, 0, 1).timesLine(new Line(rotated[i - 1].minus(rotated[0]).unit(), rotated[i].minus(rotated[0])));
            if (normal.z < 0) normal = normal.timesScalar(-1);

            let area = rotated[i].minus(rotated[0]).overLine(new Line(rotated[i - 1].minus(rotated[0]), rotated[i].minus(rotated[0]))).xy().y * rotated[i - 1].minus(rotated[0]).magnitude2();
            totalArea += area;

            let diffusePerc = 0;
            let specularPerc = 0;
            this.shade(normal, camera, (diffuseAngle, specularAngle) => {
                diffusePerc = Math.max(0, Math.cos(diffuseAngle));
                specularPerc = Math.max(0, Math.cos(specularAngle) * 100 - 99);
            });

            let rDiffuse = 255 * 4 / 8;
            let gDiffuse = 255 * 6 / 8;
            let bDiffuse = 255 * 8 / 8;

            let rAmbient = rDiffuse * 5 / 8;
            let gAmbient = gDiffuse * 5 / 8;
            let bAmbient = bDiffuse * 7 / 8;

            rAvg += ((1 - specularPerc) * (diffusePerc * (rDiffuse - rAmbient) + rAmbient) + (specularPerc * 255)) * area;
            gAvg += ((1 - specularPerc) * (diffusePerc * (gDiffuse - gAmbient) + gAmbient) + (specularPerc * 255)) * area;
            bAvg += ((1 - specularPerc) * (diffusePerc * (bDiffuse - bAmbient) + bAmbient) + (specularPerc * 255)) * area;
        }

        rAvg = rAvg / (totalArea);
        gAvg = gAvg / (totalArea);
        bAvg = bAvg / (totalArea);

        let rHex = Math.floor(rAvg).toString(16).padStart(2, '0');
        let gHex = Math.floor(gAvg).toString(16).padStart(2, '0');
        let bHex = Math.floor(bAvg).toString(16).padStart(2, '0');

        ctx.fillStyle = `#${rHex}${gHex}${bHex}FF`;
        ctx.strokeStyle = `#${rHex}${gHex}${bHex}FF`;


        let projected = []
        this.points.forEach((point) => { projected.push(point.project(camera)); });

        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        for (let i = 2; i < projected.length; i++) { ctx.lineTo(projected[i].x, projected[i].y); }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /**
     * @param {Vector3} normal
     * @param {Camera} camera
     * @param {{(diffuseAngle: number, specularAngle: number): void;}} callBack
     */
    shade(normal, camera, callBack) {

        let diffuseDir = new Vector3(-1, 1, 1);//.timesLine(camera.rotation);
        let diffuseNorm = diffuseDir.over(normal);
        let diffuseAngle = diffuseNorm.timesYZ(diffuseNorm.yz().conjugate()).xy().angle();

        let specularDir = new Vector3(-1, 1, 1);//.timesLine(camera.rotation);
        let reflectNorm = specularDir.over(normal).conjugate();
        let cameraNorm = new Vector3(0, 0, 1).over(normal);
        let reflectCamera = reflectNorm.over(cameraNorm);
        let specularAngle = reflectCamera.timesYZ(reflectCamera.yz().conjugate()).xy().angle();

        callBack(diffuseAngle, specularAngle);
    }
}

class Text3 {

    /**
     * @param {Vector3} position
     * @param {Vector3} rotation
     * @param {Vector2} offset
     * @param {string} text
     */
    constructor(position, rotation, offset, text) {
        this.position = position;
        this.rotation = rotation;
        this.offset = offset;
        this.text = text;
    }

    /**
     * @param {Camera} camera
     */
    depth(camera) { return this.position.depth(camera); }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#00000044';
        ctx.fillStyle = '#00000044';
        ctx.lineWidth = 1;

        let fontSize = 12 * 10 ** (camera.zoom / 10);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';

        let position1 = this.position.project(camera);
        let rotation1 = this.rotation.timesLine(camera.rotation).xy().unit();

        let o1 = this.offset.timesScalar(10 ** (camera.zoom / 10));
        o1 = o1.times(rotation1).conjugate().plus(position1);
        o1 = o1.plus(new Vector2(0, 0.4).timesScalar(fontSize));

        ctx.fillText(this.text, o1.x, o1.y);
    }

}

class Polygon2 {

    /**
     * @param {Vector3} position
     * @param {Vector3} rotation
     * @param {Vector2[]} point2s
     */
    constructor(position, rotation, point2s) {
        this.position = position;
        this.rotation = rotation;
        this.point2s = point2s;
    }

    /**
     * @param {Camera} camera
     */
    depth(camera) { return this.position.depth(camera); }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        ctx.strokeStyle = '#00000022';
        ctx.fillStyle = '#00000022';
        ctx.lineWidth = 1;


        let position1 = this.position.project(camera);
        let rotation1 = this.rotation.timesLine(camera.rotation).xy().unit();

        let p1 = [];
        this.point2s.forEach((point) => { p1.push(point.timesScalar(10 ** (camera.zoom / 10))); });

        let p2 = [];
        p1.forEach((point) => { p2.push(point.times(rotation1).conjugate().plus(position1)); });


        ctx.beginPath();

        ctx.moveTo(p2[0].x, p2[0].y);
        p2.forEach((point) => { ctx.lineTo(point.x, point.y); });
        ctx.closePath();
        // ctx.fill();
        ctx.stroke();
    }
}
