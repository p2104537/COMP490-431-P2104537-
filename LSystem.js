class LSystemGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    generatePlant(type, params) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let rules, axiom;
        const {branchLength, branchAngle, branchWidth, growthLevel} = params;

        switch(type) {
            case 'tree':
                axiom = 'F';
                rules = {
                    'F': 'FF+[+F-F-F]-[-F+F+F]'
                };
                this.ctx.strokeStyle = '#4A3320'; // 深褐色
                break;
            case 'bush':
                axiom = 'F';
                rules = {
                    'F': 'F[+F]F[-F]F'
                };
                this.ctx.strokeStyle = '#2D4A1D'; // 深绿色
                break;
            case 'flower':
                axiom = 'F';
                rules = {
                    'F': 'F[+F][-F[-F]F]F[+F][-F]'
                };
                this.ctx.strokeStyle = '#8B4513'; // 棕色
                break;
        }

        let result = this.applyRules(axiom, rules, growthLevel);
        this.drawPlant(result, params);
    }

    drawPlant(commands, params) {
        const {branchLength, branchAngle, branchWidth} = params;
        const stack = [];
        
        this.ctx.save();
        // 将起点移到画布底部中心
        this.ctx.translate(this.canvas.width/2, this.canvas.height * 0.8);
        this.ctx.lineWidth = branchWidth;

        for(let cmd of commands) {
            switch(cmd) {
                case 'F':
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(0, -branchLength);
                    this.ctx.stroke();
                    this.ctx.translate(0, -branchLength);
                    break;
                case '+':
                    this.ctx.rotate(-branchAngle * Math.PI/180);
                    break;
                case '-':
                    this.ctx.rotate(branchAngle * Math.PI/180);
                    break;
                case '[':
                    stack.push({
                        x: this.ctx.getTransform()
                    });
                    break;
                case ']':
                    let state = stack.pop();
                    this.ctx.setTransform(state.x);
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
