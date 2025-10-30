interface Vector2D {
    x: number;
    y: number;
}

class Paddle {
    position: Vector2D;
    width: number;
    height: number;
    speed: number;
    color: string;
    score: number;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.position = {x, y};
        this.width = width;
        this.height = height;
        this.speed = 6;
        this.color = color;
        this.score = 0;
    }

    moveUp() {
        this.position.y = Math.max(this.position.y - this.speed, 0);
    }

    moveDown(canvasHeight: number) {
        this.position.y = Math.min(this.position.y + this.speed, canvasHeight - this.height);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Ball {
    position: Vector2D;
    velocity: Vector2D;
    size: number;
    color: string;

    constructor(x: number, y: number, color: string) {
        this.position = { x, y };
        this.velocity = { x: 3, y: 2 };
        this.size = 10;
        this.color = color;
    }

    reset(canvasWidth: number, canvasHeight: number) {
        this.position = { x: canvasWidth / 2, y: canvasHeight / 2 };
        this.velocity.x = -this.velocity.x;
        this.velocity.y = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
    }

    update(canvasWidth: number, canvasHeight: number, left: Paddle, right: Paddle) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        //collision up or down
        if (this.position.y <= 0 || this.position.y >= canvasHeight - this.size) {
            this.velocity.y = -this.velocity.y;
            
            //giving force if velocity is too low
            if (Math.abs(this.velocity.y) < 1) {
                this.velocity.y = Math.sign(this.velocity.y || 1) * 1.5;
            }

            //small randomness
            this.velocity.y += (Math.random() - 0.5) * 0.5;
        }

        //collision with left paddle
        if (this.position.x <= left.position.x + left.width &&
            this.position.y + this.size >= left.position.y &&
            this.position.y <= left.position.y + left.height
        ) {
            const impact = (this.position.y - (left.position.y + left.height / 2)) / (left.height / 2);
            this.velocity.x = Math.abs(this.velocity.x);
            this.velocity.y = impact * 5;
        }

        //collision with right paddle
        if (this.position.x + this.size >= right.position.x &&
            this.position.y + this.size >= right.position.y &&
            this.position.y <= right.position.y + right.height
        ) {
            const impact = (this.position.y - (right.position.y + right.height / 2)) / (right.height / 2);
            this.velocity.x = -Math.abs(this.velocity.x);
            this.velocity.y = impact * 5;
        }

        //reset if out of bounds
        if (this.position.x > canvasWidth) {
            left.score++;
            this.reset(canvasWidth, canvasHeight);
        }
        if (this.position.x < 0) {
            right.score++;
            this.reset(canvasWidth, canvasHeight);
        }
            
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
    }
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private ball: Ball;
    private keys: Record<string, boolean> = {};

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx =this.canvas.getContext("2d")!;
        this.leftPaddle = new Paddle(20, this.canvas.height / 2 - 50, 10, 100, "white");
        this.rightPaddle = new Paddle(this.canvas.width - 30, this.canvas.height / 2 - 50, 10, 100, "white");
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, "white");

        this.setupInput();
        this.loop();
    }

    setupInput() {
        document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
        document.addEventListener("keyup", (e) => (this.keys[e.key] = false));     
    }

    update() {
        //Get key events to move the paddle
        if (this.keys["w"]) this.leftPaddle.moveUp();
        if (this.keys["s"]) this.leftPaddle.moveDown(this.canvas.height);
        if (this.keys["ArrowUp"]) this.rightPaddle.moveUp();
        if (this.keys["ArrowDown"]) this.rightPaddle.moveDown(this.canvas.height);
        
        //move the ball accordingly
        this.ball.update(this.canvas.width, this.canvas.height, this.leftPaddle, this.rightPaddle);
    }

    draw() {
        
        //background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //left/right paddle and ball
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);

        // central line
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 5]);
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        //scores
        this.ctx.font = "24px monospace";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`${this.leftPaddle.score}`, this.canvas.width / 2 - 50, 40); 
        this.ctx.textAlign = "right";
        this.ctx.fillText(`${this.rightPaddle.score}`, this.canvas.width / 2 + 50, 40);
    }

    loop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    };

}