//@ts-check
'use strict';

class Camera {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.position = new Vector3(0, 0, 0);

        this.rotation = Line.default();
        // this.rotation = this.rotation.timesYZ(Vector2.polar(1, -90 * Math.PI / 180));
        this.rotation = this.rotation.timesXZ(Vector2.polar(1, 10 * Math.PI / 180));
        this.rotation = this.rotation.timesYZ(Vector2.polar(1, 10 * Math.PI / 180));

        this.zoom = 0;


        this.destPosition = this.position;
        this.destRotation = this.rotation;
        this.destZoom = this.zoom;


        this.addMouseListener(canvas);
    }

    /** @param {HTMLCanvasElement} canvas */
    addMouseListener(canvas) {

        let mButtons = 0;

        canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); };
        canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; mButtons = 0; });

        canvas.addEventListener('mousemove', (event) => {
            if (mButtons == 1) {
                // this.rotation = this.rotation.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
                // this.rotation = this.rotation.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
                this.destRotation = this.destRotation.timesXZ(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
                this.destRotation = this.destRotation.timesYZ(Vector2.polar(1, event.movementY / 2 * Math.PI / 180));
                // this.destRotation = this.destRotation.timesXY(Vector2.polar(1, -event.movementX / 2 * Math.PI / 180));
            }
        });
        canvas.addEventListener('wheel', (event) => {
            // this.zoom -= Math.sign(event.deltaY);
            this.destZoom -= Math.sign(event.deltaY);
        });
    }

    reset() {
        let dr2 = Line.default()
        // dr2 = dr2.timesYZ(Vector2.polar(1, -90 * Math.PI / 180));
        dr2 = dr2.timesXZ(Vector2.polar(1, 10 * Math.PI / 180));
        dr2 = dr2.timesYZ(Vector2.polar(1, 10 * Math.PI / 180));
        this.destRotation = dr2;

        this.destZoom = 0;
    }

    update() {
        let mvtFactor = 3;


        let diffLine = this.destRotation.overLine(this.rotation);

        let diffDir = diffLine.v.yz().unit();
        let diffAngle = diffLine.v.timesYZ(diffDir.conjugate()).xy().angle();


        let rollLine = diffLine.w;
        rollLine.timesYZ(diffDir.conjugate());
        rollLine.timesXY(diffLine.v.timesYZ(diffDir.conjugate()).xy().conjugate());
        rollLine.timesYZ(diffDir);

        let diffRoll = rollLine.yz().angle();


        let newV = Vector3.polar(1, diffAngle / mvtFactor, 0).timesYZ(diffDir);
        let newW = Vector3.polar(1, Math.PI / 2, diffRoll / mvtFactor).times(newV);
        let stepRot = new Line(newV, newW);


        this.rotation = stepRot.timesLine(this.rotation);
        this.zoom += (this.destZoom - this.zoom) / mvtFactor;
    }
}
