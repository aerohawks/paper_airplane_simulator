import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { PaperAirplane } from './airplane.js';
import { PhysicsEngine } from './physics.js';
import { UIController } from './ui.js';

class Simulator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        // Three.js 초기화
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;

        // 카메라 위치 - 비행기를 볼 수 있는 거리
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);

        // 조명
        this.setupLights();

        // 물리 엔진
        this.physicsEngine = new PhysicsEngine();

        // 종이비행기
        this.airplane = null;

        // UI 컨트롤러
        this.uiController = new UIController();

        // 통계
        this.stats = {
            flightTime: 0,
            maxHeight: 0,
            maxDistance: 0,
            maxSpeed: 0,
            isFlying: false
        };

        this.setupEventListeners();
        this.createGround();
        this.createInitialAirplane();
        this.animate();
    }

    setupLights() {
        // 태양빛
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);

        // 주변광
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 하늘 색상
        const skyColor = new THREE.Color(0x87CEEB);
        const groundColor = new THREE.Color(0x228B22);
        const light = new THREE.HemisphereLight(skyColor, groundColor, 0.4);
        this.scene.add(light);
    }

    createGround() {
        // 지면 메시
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 물리 지면
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.physicsEngine.world.addBody(groundBody);
    }

    createInitialAirplane() {
        // 초기 비행기 생성
        const params = {
            wingSize: 1.5,
            weight: 0.5,
            bodyLength: 1.2,
            tailSize: 0.8,
            launchForce: 0,
            launchAngle: 0,
            windForce: 0,
            gravity: 9.81,
            dragCoefficient: 0.15
        };

        this.airplane = new PaperAirplane(params);
        this.airplane.body.position.set(0, 2, 0);
        this.scene.add(this.airplane.mesh);
        this.physicsEngine.world.addBody(this.airplane.body);
    }

    setupEventListeners() {
        document.getElementById('launchBtn').addEventListener('click', () => this.launch());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        // 슬라이더 값 업데이트
        const sliders = ['wingSize', 'weight', 'bodyLength', 'tailSize', 
                        'launchForce', 'launchAngle', 'windForce', 
                        'gravity', 'dragCoefficient'];
        
        sliders.forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                document.getElementById(`${id}-display`).textContent = 
                    e.target.value + (id.includes('Angle') ? '°' : '');
            });
        });

        // 창 크기 조정
        window.addEventListener('resize', () => this.onWindowResize());
    }

    launch() {
        // 기존 비행기 제거
        if (this.airplane) {
            this.scene.remove(this.airplane.mesh);
            this.physicsEngine.world.removeBody(this.airplane.body);
        }

        // 파라미터 수집
        const params = {
            wingSize: parseFloat(document.getElementById('wingSize').value),
            weight: parseFloat(document.getElementById('weight').value),
            bodyLength: parseFloat(document.getElementById('bodyLength').value),
            tailSize: parseFloat(document.getElementById('tailSize').value),
            launchForce: parseFloat(document.getElementById('launchForce').value),
            launchAngle: parseFloat(document.getElementById('launchAngle').value) * Math.PI / 180,
            windForce: parseFloat(document.getElementById('windForce').value),
            gravity: parseFloat(document.getElementById('gravity').value),
            dragCoefficient: parseFloat(document.getElementById('dragCoefficient').value)
        };

        // 새로운 비행기 생성
        this.airplane = new PaperAirplane(params);
        this.airplane.body.position.set(0, 2, 0);
        this.scene.add(this.airplane.mesh);
        this.physicsEngine.world.addBody(this.airplane.body);

        // 물리 엔진 설정
        this.physicsEngine.setGravity(params.gravity);
        this.physicsEngine.windForce = new CANNON.Vec3(params.windForce, 0, 0);
        this.physicsEngine.dragCoefficient = params.dragCoefficient;

        // 발사
        const force = params.launchForce;
        const angle = params.launchAngle;
        const velocity = new CANNON.Vec3(
            force * Math.cos(angle),
            force * Math.sin(angle),
            0
        );
        this.airplane.body.velocity = velocity;

        // 통계 초기화
        this.stats = {
            flightTime: 0,
            maxHeight: 0,
            maxDistance: 0,
            maxSpeed: 0,
            isFlying: true
        };
    }

    reset() {
        if (this.airplane) {
            this.scene.remove(this.airplane.mesh);
            this.physicsEngine.world.removeBody(this.airplane.body);
            this.airplane = null;
        }

        this.createInitialAirplane();

        this.stats = {
            flightTime: 0,
            maxHeight: 0,
            maxDistance: 0,
            maxSpeed: 0,
            isFlying: false
        };

        this.updateStats();
    }

    updateStats() {
        if (this.airplane && this.stats.isFlying) {
            const pos = this.airplane.body.position;
            const vel = this.airplane.body.velocity;

            // 최대 높이
            if (pos.y > this.stats.maxHeight) {
                this.stats.maxHeight = pos.y;
            }

            // 최대 거리
            if (pos.x > this.stats.maxDistance) {
                this.stats.maxDistance = pos.x;
            }

            // 최대 속도
            const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
            if (speed > this.stats.maxSpeed) {
                this.stats.maxSpeed = speed;
            }

            // 비행 시간
            this.stats.flightTime += 1 / 60;

            // 지면에 닿으면 비행 종료
            if (pos.y < 0.1) {
                this.stats.isFlying = false;
            }
        }

        // UI 업데이트
        document.getElementById('stat-time').textContent = this.stats.flightTime.toFixed(1) + 's';
        document.getElementById('stat-height').textContent = this.stats.maxHeight.toFixed(1) + 'm';
        document.getElementById('stat-distance').textContent = this.stats.maxDistance.toFixed(1) + 'm';
        document.getElementById('stat-speed').textContent = this.stats.maxSpeed.toFixed(1) + ' m/s';
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 물리 엔진 업데이트
        this.physicsEngine.update(this.airplane);

        // 비행기 메시 업데이트
        if (this.airplane) {
            this.airplane.updateMesh();
        }

        // 통계 업데이트
        this.updateStats();

        // 카메라 - 비행 중일 때만 추적
        if (this.airplane && this.stats.isFlying) {
            const pos = this.airplane.body.position;
            this.camera.position.x = pos.x + 2;
            this.camera.position.y = pos.y + 3;
            this.camera.position.z = pos.z + 8;
            this.camera.lookAt(pos.x, pos.y, pos.z);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}

// 시뮬레이터 시작
window.addEventListener('DOMContentLoaded', () => {
    new Simulator();
});
