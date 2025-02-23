class RandomFractalGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    generate(type, params) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(type) {
            case 'Discharge':
                this.generateDischarge(params);
                break;
            case 'Mountain Range':
                this.generateMountainRange(params);
                break;
        }
    }

    generateDischarge(params) {
        const {roughness, detailLevel, heightScale, frequency} = params;
        // 设置基本样式
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00FFFF';
        this.ctx.shadowBlur = 20;

        // 从顶部开始，在顶部随机选择几个起点
        const numStartPoints = 2 + Math.floor(Math.random() * 2); // 2-3个起点
        
        for(let i = 0; i < numStartPoints; i++) {
            // 在画布顶部1/3区域随机选择起点
            const startX = this.canvas.width * (0.3 + Math.random() * 0.4);
            const startY = 0;
            
            // 向下生成闪电，角度在正下方附近浮动
            const baseAngle = Math.PI/2; // 90度，正下方
            const startAngle = baseAngle + (Math.random() - 0.5) * 0.5; // 小范围随机偏移
            
            this.drawLightning(startX, startY, startAngle, heightScale * 100, roughness, frequency);
        }
    }

    drawLightning(x, y, angle, length, roughness, branchCount, depth = 0) {
        if (depth > branchCount) return;

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // 生成分支，主要向下延伸
        if (depth < branchCount - 1) {
            const numBranches = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numBranches; i++) {
                // 确保新分支主要向下延伸
                const branchAngle = angle + (Math.random() - 0.5) * roughness;
                // 分支长度逐渐减小
                const branchLength = length * (0.5 + Math.random() * 0.3);
                
                // 只有当分支角度主要向下时才绘制
                if (branchAngle > 0 && branchAngle < Math.PI) {
                    this.drawLightning(endX, endY, branchAngle, branchLength, roughness, branchCount, depth + 1);
                }
            }
        }
    }

    generateMountainRange(params) {
        const {roughness, detailLevel, heightScale, frequency} = params;
        const points = this.generateBasePoints(detailLevel);
        
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
