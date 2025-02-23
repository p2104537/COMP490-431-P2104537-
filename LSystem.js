class LSystemGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    generatePlant(type, params) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let rules, axiom;
        const {branchLength, branchAngle, branchWidth, growthLevel} = params;

        //const scale = 1 / (growthLevel * 0.3 + 1);// 根据迭代次数计算缩放比例

        switch(type) {
            case 'Fractal Tree':
                axiom = 'A';
                rules = {
                    'A': 'A[-B][+B]',
                    'B': 'AA'
                };
                this.ctx.strokeStyle = '#4A3320'; // 深褐色
                break;
            case 'Koch Snowflake':
                axiom = 'A++A++A';
                rules = {
                    'A': 'A-A++A-A',
                };
                this.ctx.strokeStyle = '#2D4A1D'; // 深绿色
                break;
            case 'Fractal Plant':
                axiom = 'A';
                rules = {
                    'A': 'B-[[A]+A]+B[+BA]-A',
                    'B': 'BB'
                };
                this.ctx.strokeStyle = '#8B4513'; // 棕色
                break;
        }

        let result = this.applyRules(axiom, rules, growthLevel);

         // 计算合适的缩放比例
         const bounds = this.calculateBounds(result, params);
         const scale = this.calculateScale(bounds);
         
         // 使用计算出的缩放比例绘制
        this.drawPlant(result, {
            branchAngle: branchAngle,
            branchWidth: branchWidth,
            branchLength: branchLength * scale   // 缩放分支长度
        });
    }

    calculateBounds(commands, params) {
        const {branchLength, branchAngle} = params;
        let currentLength = branchLength;
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        let x = 0, y = 0;
        let angle = -90; // 初始角度向上
        const stack = [];

        for(let cmd of commands) {
            switch(cmd) {
                case 'A':
                case 'B':
                    const dx = currentLength * Math.cos(angle * Math.PI / 180);
                    const dy = currentLength * Math.sin(angle * Math.PI / 180);
                    x += dx;
                    y += dy;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                    break;
                case '+':
                    angle += branchAngle;
                    break;
                case '-':
                    angle -= branchAngle;
                    break;
                case '[':
                    stack.push({x, y, angle, length: currentLength});
                    currentLength *= 0.7;
                    break;
                case ']':
                    const state = stack.pop();
                    x = state.x;
                    y = state.y;
                    angle = state.angle;
                    currentLength = state.length;
                    break;
            }
        }

        return {
            width: maxX - minX,
            height: maxY - minY,
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
            centerX: (maxX + minX) / 2,
            centerY: (maxY + minY) / 2
        };
    }

    calculateScale(bounds) {
        // 留出一些边距
        const padding = 100;
        const availableWidth = this.canvas.width - padding * 2;
        const availableHeight = this.canvas.height - padding * 2;
        
        // 计算宽度和高度的缩放比例
        const scaleX = availableWidth / bounds.width;
        const scaleY = availableHeight / bounds.height;
        
        // 使用较小的缩放比例以确保完全适应画布
        return Math.min(scaleX, scaleY, 1);
    }

    drawPlant(commands, params) {
        const {branchLength, branchAngle, branchWidth} = params;
        let currentLength = branchLength;
        const stack = [];

        // 先计算边界
        const bounds = this.calculateBounds(commands, params);
        
        this.ctx.save();

        this.ctx.translate(
            this.canvas.width/2 - bounds.centerX,
            this.canvas.height/2 - bounds.centerY
        );

        // 将起点移到画布底部中心
        //this.ctx.translate(this.canvas.width/2, this.canvas.height * 1);
        this.ctx.lineWidth = branchWidth;

        for(let cmd of commands) {
            switch(cmd) {
                case 'A':
                case 'B':
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(0, -currentLength);
                    this.ctx.stroke();
                    this.ctx.translate(0, -currentLength);
                    break;
                case '+':
                    this.ctx.rotate(branchAngle * Math.PI/180);
                    break;
                case '-':
                    this.ctx.rotate(-branchAngle * Math.PI/180);
                    break;
                case '[':
                    stack.push({
                        x: this.ctx.getTransform(),
                        length: currentLength
                    });
                    currentLength *= 0.7;
                    break;
                case ']':
                    let state = stack.pop();
                    this.ctx.setTransform(state.x);
                    currentLength = state.length;
                    break;
            }
        }
        this.ctx.restore();
    }

    applyRules(input, rules, iterations) {
        let result = input;
        for(let i = 0; i < iterations; i++) {
            let next = '';
            for(let char of result) {
                next += rules[char] || char;
            }
            result = next;
        }
        return result;
    }
}
