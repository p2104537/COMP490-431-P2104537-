class RandomFractalGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    generate(type, params) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(type) {
            case 'mountain':
                this.generateMountain(params);
                break;
            case 'landscape':
                this.generateLandscape(params);
                break;
        }
    }

    generateMountain(params) {
        const {roughness, detailLevel, heightScale, frequency} = params;
        const points = this.generateBasePoints(detailLevel);
        
        // 山脉特征：尖锐的峰值，陡峭的坡度
        for(let i = 0; i < frequency; i++) {
            this.midpointDisplacement(points, roughness * 1.5, true);
        }

        // 绘制带渐变的山脉
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        points.forEach(p => this.ctx.lineTo(p.x, p.y * heightScale));
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4A4A4A');
        gradient.addColorStop(1, '#8B8B8B');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    generateLandscape(params) {
        const {roughness, detailLevel, heightScale, frequency} = params;
        const points = this.generateBasePoints(detailLevel);
        
        // 使用不同的算法生成更平缓的地形
        for(let i = 0; i < frequency; i++) {
            this.diamondSquare(points, roughness * 0.5);
        }

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        points.forEach(p => this.ctx.lineTo(p.x, p.y * heightScale));
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#81C784');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    // Diamond-Square算法，生成更自然的地形
    diamondSquare(points, roughness) {
        const len = points.length;
        for(let i = 1; i < len - 1; i++) {
            const prev = points[i-1].y;
            const curr = points[i].y;
            const next = points[i+1].y;
            
            const avg = (prev + next) / 2;
            const displacement = (Math.random() - 0.5) * roughness * 200;
            points[i].y = avg + displacement;
            
            // 添加二次位移，使地形更自然
            if(i > 1 && i < len - 2) {
                const secondaryDisp = (Math.random() - 0.5) * roughness * 100;
                points[i].y += secondaryDisp * Math.sin(i / len * Math.PI);
            }
        }
    }

    generateBasePoints(detailLevel) {
        const points = [];
        const step = this.canvas.width / (Math.pow(2, detailLevel) + 1);
        for(let x = 0; x <= this.canvas.width; x += step) {
            points.push({
                x: x,
                y: this.canvas.height/2
            });
        }
        return points;
    }

    midpointDisplacement(points, roughness, sharp) {
        const newPoints = [];
        for(let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            
            newPoints.push(p1);
            
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            
            const displacement = (Math.random() - 0.5) * roughness * (p2.x - p1.x);
            newPoints.push({
                x: mx,
                y: my + (sharp ? Math.abs(displacement) : displacement)
            });
        }
        newPoints.push(points[points.length - 1]);
        
        points.length = 0;
        points.push(...newPoints);
    }
}
