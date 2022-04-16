//@ts-check
'use strict';

class PlotArea {

    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {

        canvas.focus();
        canvas.addEventListener('keypress', (event) => {
            switch (event.key) { case ' ': this.camera.reset(); break; }
        });

        let ctx = canvas.getContext('2d');


        // buffer canvas
        var buffer = document.createElement('canvas');
        var bCtx = buffer.getContext('2d');


        this.camera = new Camera(canvas);

        /** @type {(Vector2|Vector3|Line|Plane|Polygon3|Text3|Polygon2)[]} */
        this.objects = [];

        setInterval(() => {

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            buffer.width = canvas.offsetWidth;
            buffer.height = canvas.offsetHeight;

            bCtx.fillStyle = '#FFFFFF';
            bCtx.fillRect(0, 0, canvas.width, canvas.height);


            this.camera.update();

            let sorting = [];

            this.objects.forEach((object) => {
                let depth = object.depth(this.camera);
                sorting.push([object, depth]);
            });

            sorting.sort((a, b) => { return b[1] - a[1]; });
            sorting.forEach((object) => { object[0].draw(buffer, this.camera); });

        }, 1000 / 60);

        let draw = () => {
            ctx.drawImage(buffer, 0, 0);
            window.requestAnimationFrame(draw);
        }

        draw();
    }

    /** @param {Expression} equation */
    setEquation(equation) {

        this.camera.reset();

        /** @type {(Vector2|Vector3|Line|Plane|Polygon3|Text3|Polygon2)[]} */
        this.objects = [];

        let axisSize = 300;
        let frameSize = 250;
        let step = 25;

        this.drawAxis(this.objects, axisSize, frameSize, step);
        this.drawFrame(this.objects, frameSize, step);

        let blockSize = 25;
        let graph = plotGraph(frameSize, blockSize, equation);
        this.objects = this.objects.concat(graph);
    }

    /**
     * @param {(Vector3 | Line | Vector2 | Plane | Polygon3 | Text3 | Polygon2)[]} objects
     * @param {number} axisSize
     * @param {number} frameSize
     * @param {number} step
     */
    drawAxis(objects, axisSize, frameSize, step) {

        for (let i = -axisSize; i < axisSize; i += step) {
            objects.push(new Line(new Vector3(i, 0, 0), new Vector3(i + step, 0, 0)));
            objects.push(new Line(new Vector3(0, i, 0), new Vector3(0, i + step, 0)));
            objects.push(new Line(new Vector3(0, 0, i), new Vector3(0, 0, i + step)));
        }

        let arrowHead = [new Vector2(0, 5), new Vector2(20, 0), new Vector2(0, -5)];
        objects.push(new Polygon2(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), arrowHead));
        objects.push(new Polygon2(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), arrowHead));
        objects.push(new Polygon2(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), arrowHead));

        objects.push(new Text3(new Vector3(axisSize, 0, 0), new Vector3(1, 0, 0), new Vector2(30, 0), `x`));
        objects.push(new Text3(new Vector3(0, axisSize, 0), new Vector3(0, 1, 0), new Vector2(30, 0), `y`));
        objects.push(new Text3(new Vector3(0, 0, axisSize), new Vector3(0, 0, 1), new Vector2(30, 0), `z`));


        objects.push(new Text3(new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector2(0, -12), `0`));

        for (let i = -frameSize; i <= frameSize; i += 125) {
            if (i == 0) continue;

            objects.push(new Polygon2(new Vector3(i, 0, 0), new Vector3(1, 0, 0), [new Vector2(0, -5), new Vector2(0, 0)]));
            objects.push(new Polygon2(new Vector3(0, i, 0), new Vector3(0, 1, 0), [new Vector2(0, -5), new Vector2(0, 0)]));
            objects.push(new Polygon2(new Vector3(0, 0, i), new Vector3(0, 0, 1), [new Vector2(0, -5), new Vector2(0, 0)]));

            objects.push(new Text3(new Vector3(i, 0, 0), new Vector3(1, 0, 0), new Vector2(0, -12), `${i / 125}`));
            objects.push(new Text3(new Vector3(0, i, 0), new Vector3(0, 1, 0), new Vector2(0, -12), `${i / 125}`));
            objects.push(new Text3(new Vector3(0, 0, i), new Vector3(0, 0, 1), new Vector2(0, -12), `${i / 125}`));
        }
    }

    /**
     * @param {(Vector3 | Line | Vector2 | Plane | Polygon3 | Text3 | Polygon2)[]} objects
     * @param {number} frameSize
     * @param {number} step
     */
    drawFrame(objects, frameSize, step) {

        for (let i = -frameSize; i < frameSize; i += step) {
            objects.push(new Line(new Vector3(i, -frameSize, -frameSize), new Vector3(i + step, -frameSize, -frameSize)));
            objects.push(new Line(new Vector3(i, frameSize, -frameSize), new Vector3(i + step, frameSize, -frameSize)));
            objects.push(new Line(new Vector3(i, -frameSize, frameSize), new Vector3(i + step, -frameSize, frameSize)));
            objects.push(new Line(new Vector3(i, frameSize, frameSize), new Vector3(i + step, frameSize, frameSize)));

            objects.push(new Line(new Vector3(-frameSize, i, -frameSize), new Vector3(-frameSize, i + step, -frameSize)));
            objects.push(new Line(new Vector3(frameSize, i, -frameSize), new Vector3(frameSize, i + step, -frameSize)));
            objects.push(new Line(new Vector3(-frameSize, i, frameSize), new Vector3(-frameSize, i + step, frameSize)));
            objects.push(new Line(new Vector3(frameSize, i, frameSize), new Vector3(frameSize, i + step, frameSize)));

            objects.push(new Line(new Vector3(-frameSize, -frameSize, i), new Vector3(-frameSize, -frameSize, i + step)));
            objects.push(new Line(new Vector3(frameSize, -frameSize, i), new Vector3(frameSize, -frameSize, i + step)));
            objects.push(new Line(new Vector3(-frameSize, frameSize, i), new Vector3(-frameSize, frameSize, i + step)));
            objects.push(new Line(new Vector3(frameSize, frameSize, i), new Vector3(frameSize, frameSize, i + step)));
        }
    }
}
