export class UIController {
    constructor() {
        this.initializeControls();
    }

    initializeControls() {
        // 슬라이더 컨트롤 초기화
        const sliders = {
            'wingSize': { min: 0.5, max: 3, step: 0.1, default: 1.5 },
            'weight': { min: 0.1, max: 2, step: 0.1, default: 0.5 },
            'bodyLength': { min: 0.8, max: 2, step: 0.1, default: 1.2 },
            'tailSize': { min: 0.3, max: 1.5, step: 0.1, default: 0.8 },
            'launchForce': { min: 5, max: 50, step: 1, default: 25 },
            'launchAngle': { min: -30, max: 60, step: 5, default: 15 },
            'windForce': { min: 0, max: 15, step: 0.5, default: 0 },
            'gravity': { min: 5, max: 15, step: 0.5, default: 9.81 },
            'dragCoefficient': { min: 0.01, max: 0.5, step: 0.01, default: 0.15 }
        };

        Object.entries(sliders).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element) {
                element.min = config.min;
                element.max = config.max;
                element.step = config.step;
                element.value = config.default;
            }
        });
    }

    getAirplaneParams() {
        return {
            wingSize: parseFloat(document.getElementById('wingSize').value),
            weight: parseFloat(document.getElementById('weight').value),
            bodyLength: parseFloat(document.getElementById('bodyLength').value),
            tailSize: parseFloat(document.getElementById('tailSize').value)
        };
    }

    getLaunchParams() {
        return {
            force: parseFloat(document.getElementById('launchForce').value),
            angle: parseFloat(document.getElementById('launchAngle').value),
            wind: parseFloat(document.getElementById('windForce').value)
        };
    }

    getEnvironmentParams() {
        return {
            gravity: parseFloat(document.getElementById('gravity').value),
            dragCoefficient: parseFloat(document.getElementById('dragCoefficient').value)
        };
    }

    updateStats(stats) {
        document.getElementById('stat-time').textContent = stats.flightTime.toFixed(1) + 's';
        document.getElementById('stat-height').textContent = stats.maxHeight.toFixed(1) + 'm';
        document.getElementById('stat-distance').textContent = stats.maxDistance.toFixed(1) + 'm';
        document.getElementById('stat-speed').textContent = stats.maxSpeed.toFixed(1) + ' m/s';
    }
}
