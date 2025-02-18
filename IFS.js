class IFSGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(type, params) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(type) {
            case 'sierpinski':
                this.sierpinskiTriangle(params);
                break;
            case 'barnsley':
                this.barnsleyFern(params);
                break;
            case 'carpet':
                this.sierpinskiCarpet(params);
                break;
        }
    }

    sierpinskiTriangle({scale, pointSize, iterations}) {
        let x = 0, y = 0;
        const points = [];
        
        const transforms = [
            { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0 },
            { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0 },
            { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.5 }
        ];

        for(let i = 0; i < iterations; i++) {
            const transform = transforms[Math.floor(Math.random() * transforms.length)];
            const newX = transform.a * x + transform.b * y + transform.e;
            const newY = transform.c * x + transform.d * y + transform.f;
            
            x = newX;
            y = newY;
            
            if(i > 20) {
                points.push({x: x * scale, y: y * scale});
            }
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.fillStyle = 'black';
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                point.x * this.canvas.width * 0.8 + centerX * 0.6,
                point.y * this.canvas.height * 0.8 + centerY * 0.4,
                pointSize,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        });
    }

    barnsleyFern({scale, pointSize, iterations}) {
        let x = 0, y = 0;
        const points = [];
        
        for(let i = 0; i < iterations; i++) {
            const r = Math.random();
            let newX, newY;

            if(r < 0.01) {
                newX = 0;
                newY = 0.16 * y;
            } else if(r < 0.86) {
                newX = 0.85 * x + 0.04 * y;
                newY = -0.04 * x + 0.85 * y + 1.6;
            } else if(r < 0.93) {
                newX = 0.2 * x - 0.26 * y;
                newY = 0.23 * x + 0.22 * y + 1.6;
            } else {
                newX = -0.15 * x + 0.28 * y;
                newY = 0.26 * x + 0.24 * y + 0.44;
            }

            x = newX;
            y = newY;

            if(i > 20) {
                points.push({x: x, y: y});
            }
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const baseScale = this.canvas.height / 12;

        this.ctx.fillStyle = 'darkgreen';
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                (point.x + 3) * baseScale * scale + centerX - 150,
                this.canvas.height - (point.y * baseScale * scale) - 50,
                pointSize,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        });
    }

    sierpinskiCarpet({scale, depth}) {
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.8 * scale;
        const startX = (this.canvas.width - size) / 2;
        const startY = (this.canvas.height - size) / 2;
        
        this.ctx.fillStyle = 'black';
        this.drawCarpetRecursive(startX, startY, size, depth);
    }

    drawCarpetRecursive(x, y, size, depth) {
        if(depth === 0) return;

        const newSize = size / 3;
        this.ctx.fillRect(x + newSize, y + newSize, newSize, newSize);

        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(i === 1 && j === 1) continue;
                this.drawCarpetRecursive(
                    x + i * newSize,
                    y + j * newSize,
                    newSize,
                    depth - 1
                );
            }
        }
    }
}