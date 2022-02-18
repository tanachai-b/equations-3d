//@ts-check
'use strict';


class Camera {
    /**
     * @param {Celestial | Ship} center
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     * @param {number} drawX
     * @param {number} drawY
     * @param {number} drawWidth
     * @param {number} drawHeight
     */
    constructor(center, yaw, pitch, roll, drawX, drawY, drawWidth, drawHeight) {
        this.position = center.position;
        this.yawPitch = new Vector(1, 0, 0);
        this.rollx = new Vector(0, 1, 0);

        this.yawPitch = this.yawPitch.timesVector(
            new Vector(Math.cos(yaw), Math.sin(yaw), 0),
            new Vector(-Math.sin(yaw), Math.cos(yaw), 0)
        );
        this.rollx = this.rollx.timesVector(
            new Vector(Math.cos(yaw), Math.sin(yaw), 0),
            new Vector(-Math.sin(yaw), Math.cos(yaw), 0)
        );

        this.yawPitch = this.yawPitch.timesVector(
            new Vector(1, 0, 0),
            new Vector(0, Math.cos(pitch), -Math.sin(pitch))
        );
        this.rollx = this.rollx.timesVector(
            new Vector(1, 0, 0),
            new Vector(0, Math.cos(pitch), -Math.sin(pitch))
        );

        this.destYawPitch = this.yawPitch;
        this.destRollx = this.rollx;


        // this.yaw = yaw;
        // this.pitch = pitch;
        // this.roll = roll;

        this.zoom = 15;


        this.center = center;
        this.animatePosition = new Vector(0, 0, 0);

        // this.destYaw = this.yaw;
        // this.destPitch = this.pitch;
        // this.destRoll = this.roll;

        this.destZoom = this.zoom;


        this.drawX = drawX;
        this.drawY = drawY;
        this.drawWidth = drawWidth;
        this.drawHeight = drawHeight;


        Camera.addMouseListener(
            (/** @type {MouseEvent} */ event) => {
                // this.destYaw += event.movementX / 200;
                // this.destPitch -= event.movementY / 200;

                // this.destPitch = Math.min(this.destPitch, Math.PI / 2);
                // this.destPitch = Math.max(this.destPitch, -Math.PI / 2);



                this.destYawPitch = new Vector(Math.cos(event.movementX / 200), -Math.sin(event.movementX / 200), 0).timesVector(this.destYawPitch, this.destRollx);
                this.destRollx = new Vector(Math.sin(event.movementX / 200), Math.cos(event.movementX / 200), 0).timesVector(this.destYawPitch, this.destRollx);
                this.destRollx = new Vector(0, Math.cos(event.movementY / 200), -Math.sin(event.movementY / 200)).timesVector(this.destYawPitch, this.destRollx)


            }, (/** @type {WheelEvent} */ event) => {
                this.destZoom += Math.sign(event.deltaY);
            },
        );
    }

    /**
     * @param {{ (event: MouseEvent): void; }} onMove
     * @param {{ (event: WheelEvent): void; }} onWheel
     */
    static addMouseListener(onMove, onWheel) {
        let mButtons = 0;

        let canvas = document.getElementById('canvas');
        canvas.addEventListener('mousedown', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseup', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseleave', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mouseenter', (event) => { mButtons = event.buttons; });
        canvas.addEventListener('mousemove', (event) => { if (mButtons == 1) onMove(event); });
        canvas.addEventListener('wheel', (event) => { onWheel(event); });
    }

    /**
     * @param {Celestial | Ship} center
     */
    moveTo(center) {
        this.center = center;
        this.animatePosition = this.position.minus(this.center.position);
    }

    /**
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     */
    rotateTo(yaw, pitch, roll) {
        this.destYaw = yaw;
        this.destPitch = pitch;
        this.destRoll = roll;
    }

    /**
     * @param {number} zoom
     * @param {boolean} isInitial
     */
    zoomTo(zoom, isInitial) {
        this.destZoom = zoom;
        if (isInitial) this.zoom = this.destZoom;
    }

    update() {
        this.animatePosition = this.animatePosition.times(9 / 10);
        this.position = this.center.position.plus(this.animatePosition);

        // this.yaw += (this.destYaw - this.yaw) / 10;
        // this.pitch += (this.destPitch - this.pitch) / 10;
        // this.roll += (this.destRoll - this.roll) / 10;


        this.yawPitch = this.yawPitch.plus(this.destYawPitch.minus(this.yawPitch).over(10)).unit();
        this.rollx = this.rollx.plus(this.destRollx.minus(this.rollx).over(10)).unit();



        // let dir2d = this.destYawPitch.overVector(this.yawPitch, this.rollx);
        // let dir1d = dir2d.timesVector(new Vector(1, 0, 0), new Vector(0, dir2d.y, -dir2d.z));
        // let diffAngle = Math.atan2(dir1d.y, dir1d.x) / 10;

        // let roll0 = this.rollx.overVector(this.yawPitch, this.rollx);

        // // console.log(dir1d);
        // let yawPitch1 = new Vector(Math.cos(diffAngle), Math.sin(diffAngle), 0).timesVector(new Vector(1, 0, 0), new Vector(0, dir2d.y, dir2d.z)).timesVector(this.yawPitch, this.rollx);
        // let rollx1 = roll0.timesVector(new Vector(1, 0, 0), new Vector(0, dir2d.y, -dir2d.z))
        //     .timesVector(new Vector(Math.cos(diffAngle), Math.sin(diffAngle), 0), new Vector(-Math.sin(diffAngle), Math.cos(diffAngle), 0))
        //     .timesVector(new Vector(1, 0, 0), new Vector(0, dir2d.y, dir2d.z))
        //     .timesVector(this.yawPitch, this.rollx);


        // // let roll2d1 = this.rollx.overVector(this.yawPitch, this.rollx);
        // // let diffRollAngle1 = Math.atan2(roll2d1.y, roll2d1.x);
        // // let roll2d = this.destRollx.overVector(this.destYawPitch, this.destRollx);
        // // let diffRollAngle = Math.atan2(roll2d.y, roll2d.x);

        // // let realdifan = (diffRollAngle - diffRollAngle1)/10

        // // let rollx1 = new Vector(0, Math.cos(realdifan), Math.sin(realdifan)).timesVector(new Vector(1, 0, 0), new Vector(0, roll2d1.y, roll2d1.z)).timesVector(this.yawPitch, this.rollx);


        // this.yawPitch = yawPitch1;
        // this.rollx = rollx1;



        this.zoom += (this.destZoom - this.zoom) / 10;
    }
}

class Celestial {
    /**
     * @param {string} label
     * @param {number} radius
     * @param {number} mass
     * @param {Celestial} [primary]
     * @param {Orbit} [orbit]
     * @param {number} [trueAnomaly]
     */
    constructor(
        label,
        radius,
        mass,
        primary,
        orbit,
        trueAnomaly,
    ) {
        this.label = label;
        this.radius = radius;
        this.mass = mass;
        this.primary = primary;
        this.orbit = orbit;
        this.trueAnomaly = trueAnomaly;

        this.angularVelocity = 0;

        this.position = new Vector(0, 0, 0);
        this.velocity = new Vector(0, 0, 0);

        if (this.primary != null) {
            let relPosition = this.orbit.getPosition(this.trueAnomaly);

            let orbitalSpeed = Math.sqrt(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * (2 / relPosition.magnitude() - 1 / this.orbit.semiMajorAxis));
            let relVelocity = this.orbit.getPosition(this.trueAnomaly + 0.000001).minus(relPosition).unit().times(orbitalSpeed);

            this.angularVelocity = relVelocity.overVector(relPosition.unit(), relVelocity).y / relPosition.magnitude();

            this.position = relPosition.plus(this.primary.position);
            this.velocity = relVelocity.plus(this.primary.velocity);
        }

        this.satellites = [this];
    }

    /**
     * @param {number} timeSpeed
     */
    updateVelocity(timeSpeed) {
        if (this.primary == null) return;

        let relPosition = this.orbit.getPosition(this.trueAnomaly);

        let orbitalSpeed = Math.sqrt(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * 10 ** timeSpeed * (2 / relPosition.magnitude() - 1 / this.orbit.semiMajorAxis));
        let relVelocity = this.orbit.getPosition(this.trueAnomaly + 0.000001).minus(relPosition).unit().times(orbitalSpeed);
        this.velocity = relVelocity.over(10 ** (timeSpeed / 2)).plus(this.primary.velocity);

        this.angularVelocity = relVelocity.overVector(relPosition.unit(), relVelocity).y / relPosition.magnitude();
    }

    updatePosition() {
        if (this.primary == null) return;

        this.trueAnomaly += this.angularVelocity;
        this.position = this.orbit.getPosition(this.trueAnomaly).plus(this.primary.position);
    }

    /**
     * @param {Camera[]} cameras
     * @param {boolean} isTarget
     * @param {boolean} isShipPrimary
     */
    draw(cameras, isTarget, isShipPrimary) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;


        if (isTarget && !isShipPrimary) {
            ctx.strokeStyle = '#FF8800';
            ctx.fillStyle = '#FF8800';
        } else {
            ctx.strokeStyle = '#888888';
            ctx.fillStyle = '#888888';
        }

        cameras.forEach((/** @type {Camera} */ camera) => {

            ctx.save();
            ctx.beginPath();
            ctx.rect(camera.drawX, camera.drawY, camera.drawWidth, camera.drawHeight);
            ctx.clip();


            let posProj = Complex.projectFrom3d(this.position, camera);
            ctx.strokeRect(posProj.x - 3.5, posProj.y - 3.5, 8, 8);

            if (this.primary != null) {
                let primaryProj = Complex.projectFrom3d(this.primary.position, camera);
                if (primaryProj.minus(posProj).magnitude() > 20) { ctx.fillText(this.label, posProj.x + 8, posProj.y + 4); }
            } else {
                ctx.fillText(this.label, posProj.x + 8, posProj.y + 4);
            }


            let circle = Complex.projectSphere(this.radius, this.position, camera);

            for (let i = 0; i < circle.length - 1; i++) {
                ctx.beginPath();
                ctx.moveTo(circle[i].x, circle[i].y);
                ctx.lineTo(circle[i + 1].x, circle[i + 1].y);
                ctx.stroke();
            }


            ctx.restore();
        });


        if (this.orbit != null) {
            if (isTarget && !isShipPrimary) {
                ctx.strokeStyle = '#FF8800';
                ctx.fillStyle = '#FF8800';
                ctx.globalAlpha = 1;

                this.orbit.draw(ctx, cameras, false, this.primary.position, null, null, 1);
            } else {
                ctx.strokeStyle = '#FFFFFF';
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.2;

                this.orbit.draw(ctx, cameras, false, this.primary.position, null, null, 5);
            }
        }


        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 1;
    }
}

class Ship {
    /**
     * @param {string} label
     * @param {number} radius
     * @param {number} mass
     * @param {Celestial} primary
     * @param {Orbit} orbit
     * @param {number} trueAnomaly
     */
    constructor(
        label,
        radius,
        mass,
        primary,
        orbit,
        trueAnomaly,
    ) {
        this.label = label;
        this.radius = radius;
        this.mass = mass;
        this.primary = primary;
        this.orbit = orbit;
        this.trueAnomaly = trueAnomaly;

        this.position = new Vector(0, 0, 0);
        this.velocity = new Vector(0, 0, 0);

        if (this.primary != null) {
            let relPosition = this.orbit.getPosition(this.trueAnomaly);
            this.position = relPosition.plus(this.primary.position);

            let orbitalSpeed = Math.sqrt(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * (2 / relPosition.magnitude() - 1 / this.orbit.semiMajorAxis));
            let orbitalDirection = this.orbit.getPosition(this.trueAnomaly + 0.000001).minus(relPosition).unit();
            this.velocity = orbitalDirection.times(orbitalSpeed).plus(this.primary.velocity);
        }

        this.target = null;
        this.relativeOrbit = null;
        this.approachTrajectory = [];

        this.closestApproach = new Vector(0, 0, 0);
        this.approachSpeed = 0;
        this.approachTime = 0;

        this.closestShip = new Vector(0, 0, 0);
        this.closestTarget = new Vector(0, 0, 0);

        this.period = 0;

        this.relOrbYaw = new Vector(0, 0, 0);
        this.relOrbRoll = new Vector(0, 0, 0);
    }

    /**
     * @param {Celestial} primary
     */
    setPrimary(primary) { this.primary = primary; }
    /**
     * @param {Celestial} target
     */
    setTarget(target) { this.target = target; }

    /**
     * @param {number} prograde
     * @param {number} radialIn
     * @param {number} normal
     */
    thrust(prograde, radialIn, normal) {

        let relPosition = this.position.minus(this.primary.position);
        let relVelocity = this.velocity.minus(this.primary.velocity);

        let thrust = new Vector(prograde, radialIn, normal).timesVector(relVelocity.unit(), relPosition.times(-1));

        this.velocity = this.velocity.plus(thrust);
    }

    /**
     * @param {number} timeSpeed
     * @param {Celestial[]} celestials
     */
    updateVelocity(timeSpeed, celestials) {

        let acceleration = new Vector(0, 0, 0);

        celestials.forEach((/** @type {{ position: { minus: (arg0: any) => any; }; mass: number; }} */ celestial) => {
            let distance = celestial.position.minus(this.position);
            let gravity = distance.over(distance.magnitude() ** 3).times(celestial.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * 10 ** (timeSpeed / 2));
            acceleration = acceleration.plus(gravity);
        });

        this.velocity = this.velocity.plus(acceleration);
    }

    /**
     * @param {number} timeSpeed
     */
    updatePosition(timeSpeed) {
        this.position = this.position.plus(this.velocity.times(10 ** (timeSpeed / 2)));
    }

    updateOrbit() {

        let relPosition = this.position.minus(this.primary.position);
        let relVelocity = this.velocity.minus(this.primary.velocity);
        let perpenVelocity = relVelocity.overVector(relPosition.unit(), relVelocity).y;

        let distance = relPosition.magnitude();
        let speed = relVelocity.magnitude();
        let semiMajorAxis = 1 / (2 / distance - speed ** 2 / (this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2));

        let orbitalEnergy = -(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 / (2 * semiMajorAxis));
        let angularMomentum = relPosition.magnitude() * perpenVelocity;
        let eccentricity = Math.sqrt(1 + (2 * orbitalEnergy * angularMomentum ** 2 / (this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2) ** 2));

        let normal = new Vector(0, 0, 1).timesVector(relPosition.unit(), relVelocity);
        let ascNode = new Vector(0, 0, 1).timesVector(new Vector(0, 0, 1), normal);
        let longAscending = Math.acos(ascNode.x);
        if (ascNode.y < 0) longAscending = 2 * Math.PI - longAscending;

        let inclination = Math.acos(normal.z);

        let eccenVector = new Vector(0, 0, angularMomentum).timesVector(relVelocity, normal).over(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2).minus(relPosition.unit());
        let eccenOnAscNode = eccenVector.overVector(ascNode, new Vector(0, 0, 1).timesVector(normal, ascNode));
        let argPeriapsis = Math.atan2(eccenOnAscNode.y, eccenOnAscNode.x);

        let posOnEccenVector = relPosition.overVector(eccenVector.unit(), new Vector(0, 0, 1).timesVector(normal, eccenVector));
        this.trueAnomaly = Math.atan2(posOnEccenVector.y, posOnEccenVector.x);


        this.orbit = new Orbit(
            semiMajorAxis,
            eccentricity,
            longAscending,
            inclination,
            argPeriapsis
        );


        this.period = 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / (this.primary.mass * 6.6743015 * 10 ** -20));
    }

    updateRelativeOrbit() {
        if (this.target.orbit == null) return;


        let relPosition = this.position.minus(this.primary.position);
        let relVelocity = this.velocity.minus(this.primary.velocity);


        let yawDiff = -this.target.orbit.longAscending;
        let rollDiff = -this.target.orbit.inclination;

        let yaw = new Vector(Math.cos(yawDiff), Math.sin(yawDiff), 0);
        let roll = new Vector(0, Math.cos(rollDiff), Math.sin(rollDiff));

        relPosition = relPosition.timesVector(yaw, new Vector(-yaw.y, yaw.x, 0));
        relVelocity = relVelocity.timesVector(yaw, new Vector(-yaw.y, yaw.x, 0));

        relPosition = relPosition.timesVector(new Vector(1, 0, 0), roll);
        relVelocity = relVelocity.timesVector(new Vector(1, 0, 0), roll);


        this.relOrbYaw = new Vector(Math.cos(yawDiff), -Math.sin(yawDiff), 0);
        this.relOrbRoll = new Vector(0, Math.cos(rollDiff), -Math.sin(rollDiff));
        this.relOrbRoll = this.relOrbRoll.timesVector(this.relOrbYaw, new Vector(-this.relOrbYaw.y, this.relOrbYaw.x, 0));



        let perpenVelocity = relVelocity.overVector(relPosition.unit(), relVelocity).y;

        let distance = relPosition.magnitude();
        let speed = relVelocity.magnitude();
        let semiMajorAxis = 1 / (2 / distance - speed ** 2 / (this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2));

        let orbitalEnergy = -(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 / (2 * semiMajorAxis));
        let angularMomentum = relPosition.magnitude() * perpenVelocity;
        let eccentricity = Math.sqrt(1 + (2 * orbitalEnergy * angularMomentum ** 2 / (this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2) ** 2));

        let normal = new Vector(0, 0, 1).timesVector(relPosition.unit(), relVelocity);
        let ascNode = new Vector(0, 0, 1).timesVector(new Vector(0, 0, 1), normal);
        let longAscending = Math.acos(ascNode.x);
        if (ascNode.y < 0) longAscending = 2 * Math.PI - longAscending;

        let inclination = Math.acos(normal.z);

        let eccenVector = new Vector(0, 0, angularMomentum).timesVector(relVelocity, normal).over(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2).minus(relPosition.unit());
        let eccenOnAscNode = eccenVector.overVector(ascNode, new Vector(0, 0, 1).timesVector(normal, ascNode));
        let argPeriapsis = Math.atan2(eccenOnAscNode.y, eccenOnAscNode.x);

        // let posOnEccenVector = relPosition.overVector(eccenVector.unit(), new Vector(0, 0, 1).timesVector(normal, eccenVector));
        // this.trueAnomaly = Math.atan2(posOnEccenVector.y, posOnEccenVector.x);


        this.relativeOrbit = new Orbit(
            semiMajorAxis,
            eccentricity,
            longAscending,
            inclination,
            argPeriapsis
        );
    }

    updateApproachTrajectory() {
        if (this.target.orbit == null) return;


        let shipOrbit = this.orbit;
        let targetOrbit = this.target.orbit;

        let shipPeriod = 2 * Math.PI * Math.sqrt(shipOrbit.semiMajorAxis ** 3 / this.primary.mass);
        let targetPeriod = 2 * Math.PI * Math.sqrt(targetOrbit.semiMajorAxis ** 3 / this.primary.mass);


        this.approachTrajectory = [];

        let shipAnomaly = this.trueAnomaly;
        let targetAnomaly = this.target.trueAnomaly;

        let closestDistance = Number.MAX_SAFE_INTEGER;

        while (
            shipAnomaly <= this.trueAnomaly + 2 * Math.PI &&
            targetAnomaly <= this.target.trueAnomaly + 2 * Math.PI &&
            this.approachTrajectory.length < 1000
        ) {

            let shipPosition = shipOrbit.getPosition(shipAnomaly);
            let targetPosition = targetOrbit.getPosition(targetAnomaly);


            let shipSpeed = Math.sqrt(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * Math.min(shipPeriod, targetPeriod) ** 2 * 10 ** 17.0 * (2 / shipPosition.magnitude() - 1 / shipOrbit.semiMajorAxis));
            let shipVelocity = shipOrbit.getPosition(shipAnomaly + 0.000001).minus(shipPosition).unit().times(shipSpeed);
            let shipAngular = shipVelocity.overVector(shipPosition.unit(), shipVelocity).y / shipPosition.magnitude();

            let targetSpeed = Math.sqrt(this.primary.mass * 6.6743015 * 10 ** -20 / 60 ** 2 * Math.min(shipPeriod, targetPeriod) ** 2 * 10 ** 17.0 * (2 / targetPosition.magnitude() - 1 / targetOrbit.semiMajorAxis));
            let targetVelocity = targetOrbit.getPosition(targetAnomaly + 0.000001).minus(targetPosition).unit().times(targetSpeed);
            let targetAngular = targetVelocity.overVector(targetPosition.unit(), targetVelocity).y / targetPosition.magnitude();


            let diffPos = shipPosition.minus(targetPosition)
            diffPos = diffPos.overVector(targetPosition.unit(), targetVelocity);
            this.approachTrajectory.push(diffPos);


            if (diffPos.magnitude() < closestDistance) {
                closestDistance = diffPos.magnitude();

                this.closestApproach = diffPos;
                this.approachSpeed = targetVelocity.minus(shipVelocity).magnitude() / (Math.min(shipPeriod, targetPeriod) * 10 ** (17.0 / 2));
                this.approachTime = (this.approachTrajectory.length - 1) / 60 * Math.min(shipPeriod, targetPeriod) * 10 ** (17.0 / 2);

                this.closestShip = shipPosition;
                this.closestTarget = targetPosition;
            }


            shipAnomaly += shipAngular;
            targetAnomaly += targetAngular;
        }
        // console.log(this.approachTrajectory.length);
    }

    /**
     * @param {Camera[]} cameras
     * @param {boolean} enableApproachTrajectory
     */
    draw(cameras, enableApproachTrajectory) {

        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;


        ctx.strokeStyle = '#0088FF';
        ctx.fillStyle = '#0088FF';


        cameras.forEach((/** @type {Camera} */ camera) => {

            ctx.save();
            ctx.beginPath();
            ctx.rect(camera.drawX, camera.drawY, camera.drawWidth, camera.drawHeight);
            ctx.clip();


            let posProj = Complex.projectFrom3d(this.position, camera);
            ctx.strokeRect(posProj.x - 3.5, posProj.y - 3.5, 8, 8);

            let primaryProj = Complex.projectFrom3d(this.primary.position, camera);
            if (primaryProj.minus(posProj).magnitude() > 20) { ctx.fillText(this.label, posProj.x + 8, posProj.y + 4); }


            let circle = Complex.projectSphere(this.radius, this.position, camera);

            for (let i = 0; i < circle.length - 1; i++) {
                ctx.beginPath();
                ctx.moveTo(circle[i].x, circle[i].y);
                ctx.lineTo(circle[i + 1].x, circle[i + 1].y);
                ctx.stroke();
            }


            ctx.restore();
        });


        if (this.target.orbit != null && this.relativeOrbit != null) {
            this.relativeOrbit.draw(ctx, cameras, true, this.primary.position, this.relOrbYaw, this.relOrbRoll, 1);
        } else {
            this.orbit.draw(ctx, cameras, true, this.primary.position, null, null, 1);
        }


        ctx.strokeStyle = '#FFFFFF';




        if (this.target.orbit != null && this.approachTrajectory != null) {

            if (enableApproachTrajectory) {

                let relTraj1s = [];

                for (let i = 0; i < this.approachTrajectory.length; i++) {
                    let traj1 = this.approachTrajectory[i].timesVector(this.target.position.minus(this.primary.position).unit(), this.target.velocity.minus(this.primary.velocity));
                    let relTraj1 = traj1.plus(this.target.position);
                    relTraj1s.push(relTraj1);
                }

                let closest = this.closestApproach.timesVector(this.target.position.minus(this.primary.position).unit(), this.target.velocity.minus(this.primary.velocity));
                let closest1 = closest.plus(this.target.position);

                cameras.forEach((/** @type {Camera} */ camera) => {

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(camera.drawX, camera.drawY, camera.drawWidth, camera.drawHeight);
                    ctx.clip();


                    ctx.strokeStyle = '#FF0088';

                    for (let i = 0; i < relTraj1s.length - 1; i++) {

                        let trajProj1 = Complex.projectFrom3d(relTraj1s[i], camera);
                        let trajProj2 = Complex.projectFrom3d(relTraj1s[i + 1], camera);

                        ctx.beginPath();
                        ctx.moveTo(trajProj1.x, trajProj1.y);
                        ctx.lineTo(trajProj2.x, trajProj2.y);
                        ctx.stroke();
                    }

                    ctx.strokeStyle = '#FFFFFF';


                    let closestProj = Complex.projectFrom3d(closest1, camera);
                    ctx.beginPath();
                    ctx.strokeRect(closestProj.x - 2, closestProj.y - 2, 4, 4);
                    ctx.stroke();


                    ctx.restore();
                });
            }

            if (this.primary.label != this.target.label) {

                let closestShip1 = this.closestShip.plus(this.primary.position);
                let closestTarget1 = this.closestTarget.plus(this.primary.position);

                cameras.forEach((/** @type {Camera} */ camera) => {

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(camera.drawX, camera.drawY, camera.drawWidth, camera.drawHeight);
                    ctx.clip();


                    let closestShipProj = Complex.projectFrom3d(closestShip1, camera);
                    ctx.beginPath();
                    ctx.strokeRect(closestShipProj.x - 2, closestShipProj.y - 2, 4, 4);
                    ctx.stroke();

                    let closestTargetProj = Complex.projectFrom3d(closestTarget1, camera);
                    ctx.beginPath();
                    ctx.strokeRect(closestTargetProj.x - 2, closestTargetProj.y - 2, 4, 4);
                    ctx.stroke();


                    ctx.restore();
                });
            }
        }
    }
}

class Orbit {
    /**
     * @param {number} semiMajorAxis
     * @param {number} eccentricity
     * @param {number} longAscending
     * @param {number} inclination
     * @param {number} argPeriapsis
     */
    constructor(
        semiMajorAxis,
        eccentricity,
        longAscending,
        inclination,
        argPeriapsis,
    ) {
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.longAscending = longAscending;
        this.inclination = inclination;
        this.argPeriapsis = argPeriapsis;

        this.periapsis = this.getPosition(0);
        this.apoapsis = this.getPosition(Math.PI);
        this.ascending = this.getPosition(-this.argPeriapsis);
        this.descending = this.getPosition(-this.argPeriapsis + Math.PI);
    }

    /**
     * @param {number} trueAnomaly
     * @param {{ (position: Vector): void; }} [ifLeftOfPeriapsis]
     */
    getPosition(trueAnomaly, ifLeftOfPeriapsis) {
        let distance = this.semiMajorAxis * (1 - this.eccentricity ** 2) / (1 + this.eccentricity * Math.cos(trueAnomaly));
        let position = new Vector(distance * Math.cos(trueAnomaly), distance * Math.sin(trueAnomaly), 0);

        let maxRight = this.semiMajorAxis * (1 - this.eccentricity ** 2) / (1 + this.eccentricity);

        let position2 = position.timesVector(
            new Vector(Math.cos(this.argPeriapsis), Math.sin(this.argPeriapsis), 0),
            new Vector(-Math.sin(this.argPeriapsis), Math.cos(this.argPeriapsis), 0)
        );
        let position3 = position2.timesVector(
            new Vector(1, 0, 0),
            new Vector(0, Math.cos(this.inclination), Math.sin(this.inclination))
        );
        let position4 = position3.timesVector(
            new Vector(Math.cos(this.longAscending), Math.sin(this.longAscending), 0),
            new Vector(-Math.sin(this.longAscending), Math.cos(this.longAscending), 0)
        );

        if (ifLeftOfPeriapsis != null && position.x < maxRight) ifLeftOfPeriapsis(position4);
        return position4;
    }

    /**
     * @param {number} trueAnomaly
     */
    isLeftOfPeri(trueAnomaly) {
        let distance = this.semiMajorAxis * (1 - this.eccentricity ** 2) / (1 + this.eccentricity * Math.cos(trueAnomaly));
        let maxRight = this.semiMajorAxis * (1 - this.eccentricity ** 2) / (1 + this.eccentricity);

        return distance * Math.cos(trueAnomaly) <= maxRight;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera[]} cameras
     * @param {boolean} isDrawNodes
     * @param {Vector} translation
     * @param {Vector} [yawPitch]
     * @param {Vector} [roll]
     * @param {number} [angle]
     */
    draw(ctx, cameras, isDrawNodes, translation, yawPitch, roll, angle) {

        if (yawPitch == null) { yawPitch = new Vector(1, 0, 0); }
        if (roll == null) { roll = new Vector(0, 1, 0); }
        if (angle == null) { angle = 5; }


        let positions = [];
        for (let i = -Math.PI; i <= Math.PI; i += Math.PI / 180 * angle) {
            this.getPosition(i, (/** @type {Vector} */ position) => { positions.push(position.timesVector(yawPitch, roll).plus(translation)); });
        }


        let periapsis1 = this.periapsis.timesVector(yawPitch, roll).plus(translation);
        let apoapsis1 = this.apoapsis.timesVector(yawPitch, roll).plus(translation);
        let ascending1 = this.ascending.timesVector(yawPitch, roll).plus(translation);
        let descending1 = this.descending.timesVector(yawPitch, roll).plus(translation);


        let lineStart = this.ascending;
        let lineEnd = this.descending;
        if (!this.isLeftOfPeri(-this.argPeriapsis)) lineStart = new Vector(0, 0, 0);
        if (!this.isLeftOfPeri(-this.argPeriapsis + Math.PI)) lineEnd = new Vector(0, 0, 0);

        /**
         * @type {Vector[]}
         */
        this.ascDescLine = [];
        for (let i = 0; i <= 100; i++) {
            let position = lineEnd.minus(lineStart).over(100).times(i).plus(lineStart);
            this.ascDescLine.push(position.timesVector(yawPitch, roll).plus(translation));
        }


        cameras.forEach((/** @type {Camera} */ camera) => {

            ctx.save();
            ctx.beginPath();
            ctx.rect(camera.drawX, camera.drawY, camera.drawWidth, camera.drawHeight);
            ctx.clip();


            for (let i = 0; i < positions.length - 1; i++) {
                let aProj = Complex.projectFrom3d(positions[i], camera);
                let bProj = Complex.projectFrom3d(positions[i + 1], camera);

                ctx.beginPath();
                ctx.moveTo(aProj.x, aProj.y);
                ctx.lineTo(bProj.x, bProj.y);
                ctx.stroke();
            }


            if (isDrawNodes) {

                let periProj = Complex.projectFrom3d(periapsis1, camera);
                ctx.beginPath();
                ctx.moveTo(periProj.x - 4, periProj.y);
                ctx.lineTo(periProj.x, periProj.y + 4);
                ctx.lineTo(periProj.x + 4, periProj.y);
                ctx.lineTo(periProj.x, periProj.y - 4);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                if (this.isLeftOfPeri(Math.PI)) {
                    let apoProj = Complex.projectFrom3d(apoapsis1, camera);
                    ctx.beginPath();
                    ctx.moveTo(apoProj.x - 4, apoProj.y);
                    ctx.lineTo(apoProj.x, apoProj.y + 4);
                    ctx.lineTo(apoProj.x + 4, apoProj.y);
                    ctx.lineTo(apoProj.x, apoProj.y - 4);
                    ctx.closePath();
                    ctx.stroke();
                }

                if (this.isLeftOfPeri(-this.argPeriapsis)) {
                    let ascProj = Complex.projectFrom3d(ascending1, camera);
                    ctx.beginPath();
                    ctx.moveTo(ascProj.x, ascProj.y - 4);
                    ctx.lineTo(ascProj.x + 3, ascProj.y + 2);
                    ctx.lineTo(ascProj.x - 3, ascProj.y + 2);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                }

                if (this.isLeftOfPeri(-this.argPeriapsis + Math.PI)) {
                    let descProj = Complex.projectFrom3d(descending1, camera);
                    ctx.beginPath();
                    ctx.moveTo(descProj.x, descProj.y + 4);
                    ctx.lineTo(descProj.x + 3, descProj.y - 2);
                    ctx.lineTo(descProj.x - 3, descProj.y - 2);
                    ctx.closePath();
                    ctx.stroke();
                }


                ctx.setLineDash([1, 10]);
                for (let i = 0; i < this.ascDescLine.length - 1; i++) {
                    let start = Complex.projectFrom3d(this.ascDescLine[i], camera);
                    let end = Complex.projectFrom3d(this.ascDescLine[i + 1], camera);

                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
            }

            ctx.restore();
        });
    }
}