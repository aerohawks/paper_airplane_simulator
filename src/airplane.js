import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export class PaperAirplane {
    constructor(params) {
        this.params = params;
        this.mass = params.weight;

        // 물리 바디 생성
        this.body = new CANNON.Body({
            mass: this.mass,
            shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.05, params.bodyLength * 0.5))
        });
        this.body.position.set(0, 2, 0);

        // 메시 생성
        this.mesh = this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // 동체 (몸)
        const bodyGeometry = new THREE.BoxGeometry(
            0.15,
            0.08,
            this.params.bodyLength
        );
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // 왼쪽 날개
        const wingGeometry = new THREE.BoxGeometry(
            this.params.wingSize * 1.5,
            0.01,
            this.params.bodyLength * 0.6
        );
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff6b6b,
            roughness: 0.2,
            metalness: 0.05
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.x = -this.params.wingSize * 0.75;
        leftWing.position.z = -0.2;
        leftWing.castShadow = true;
        group.add(leftWing);

        // 오른쪽 날개
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.x = this.params.wingSize * 0.75;
        rightWing.position.z = -0.2;
        rightWing.castShadow = true;
        group.add(rightWing);

        // 꼬리 (위쪽)
        const tailGeometry = new THREE.BoxGeometry(
            0.05,
            this.params.tailSize * 0.8,
            this.params.tailSize
        );
        const tailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4ecdc4,
            roughness: 0.2
        });
        
        const topTail = new THREE.Mesh(tailGeometry, tailMaterial);
        topTail.position.y = this.params.tailSize * 0.4;
        topTail.position.z = -(this.params.bodyLength * 0.5 - 0.2);
        topTail.castShadow = true;
        group.add(topTail);

        // 꼬리 (아래쪽)
        const bottomTail = new THREE.Mesh(tailGeometry, tailMaterial);
        bottomTail.position.y = -this.params.tailSize * 0.4;
        bottomTail.position.z = -(this.params.bodyLength * 0.5 - 0.2);
        bottomTail.castShadow = true;
        group.add(bottomTail);

        // 조종실 (노즈)
        const noseGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
        const noseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x45b7d1,
            roughness: 0.1,
            metalness: 0.2
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.z = this.params.bodyLength * 0.5;
        nose.castShadow = true;
        group.add(nose);

        return group;
    }

    updateMesh() {
        // 바디 위치 업데이트
        this.mesh.position.copy(this.body.position);

        // 바디 회전 업데이트
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    getWingArea() {
        return this.params.wingSize * this.params.bodyLength;
    }
}
