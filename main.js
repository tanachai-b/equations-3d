//@ts-check
'use strict';


window.onload = function () {

    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');


    canvas.oncontextmenu = function (event) { event.preventDefault(); event.stopPropagation(); }




    let mButtons = 0;
    // let mVector2 = new Vector2(0, 0);

    let zoom = 0;
    let yaw = 0;
    let pitch = 0;



    canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
    canvas.addEventListener('mousemove', (event) => {
        if (mButtons == 1) {
            // mVector2 = new Vector2(event.offsetX - canvas.width / 2, -event.offsetY + canvas.height / 2);

            yaw += event.movementX / 200;
            pitch -= event.movementY / 200;
        }
    });
    canvas.addEventListener('wheel', (event) => {
        zoom -= Math.sign(event.deltaY);
    });








    setInterval(() => {





        /** @type {[Vector2 | Vector3]} */
        let objects = [
            new Vector2(0, 0),
            // mVector2,
        ];



        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                for (let k = -1; k <= 1; k += 2) {
                    let v1 = new Vector3(i * 200, j * 200, k * 200);
                    objects.push(v1);
                }
            }
        }



        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                for (let k = 0; k < 10; k++) {

                    let v1 = new Vector3(i * 20 + 50, j * 20 + 30, k * 20 + 20);


                    let plane = new Vector3(1, 0.5, 0.5).unit();

                    let v2 = v1.timesPlane(plane, new Vector3(0, 1, 0).timesXY(plane.xy().unit()));

                    let v3 = v2.overPlane(plane, new Vector3(0, 1, 0).timesXY(plane.xy().unit()));

                    objects.push(v3);
                }
            }
        }





        ctx.clearRect(0, 0, canvas.width, canvas.height);

        objects.forEach((object) => {
            object.draw(zoom, yaw, pitch);
        });


    }, 1000 / 60);









}
