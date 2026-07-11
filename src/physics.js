import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export class PhysicsEngine {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.81, 0);
        this.world.defaultContactMaterial.friction = 0.3;
        this.world.defaultContactMaterial.restitution = 0.3;
        
        this.windForce = new CANNON.Vec3(0, 0, 0);
        this.dragCoefficient = 0.15;
        this.timeStep = 1 / 60;
    }

    setGravity(gravity) {
        this.world.gravity.y = -gravity;
    }

    update(airplane) {
        if (!airplane) return;

        // 바람 힘 적용
        if (this.windForce.length() > 0) {
            airplane.body.applyForce(
                this.windForce,
                airplane.body.position
            );
        }

        // 공기 저항 적용
        const velocity = airplane.body.velocity;
        const speed = velocity.length();
        
        if (speed > 0.1) {
            // 드래그 힘 = -0.5 * rho * v^2 * Cd * A * v_direction
            const dragMagnitude = 0.5 * 1.225 * speed * speed * this.dragCoefficient * airplane.getWingArea();
            const dragForce = velocity.clone();
            dragForce.normalize();
            dragForce.scale(-dragMagnitude, dragForce);
            
            airplane.body.applyForce(
                dragForce,
                airplane.body.position
            );
        }

        // 양력 계산 (간단한 모델)
        if (speed > 2) {
            // 양력 = 0.5 * rho * v^2 * Cl * A
            const liftCoefficient = 0.5;
            const liftMagnitude = 0.5 * 1.225 * speed * speed * liftCoefficient * airplane.getWingArea();
            
            // 양력은 수직 방향 (위쪽)
            const liftForce = new CANNON.Vec3(0, liftMagnitude, 0);
            airplane.body.applyForce(
                liftForce,
                airplane.body.position
            );
        }

        // 물리 세계 업데이트
        this.world.step(this.timeStep);
    }
}
