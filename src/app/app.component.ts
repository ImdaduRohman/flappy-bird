import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fb';

  // Canvas
  boardWidth = 360;
  boardHeight = 640;

  // Bird
  birdWidth = 45;
  birdHeight = 42;
  birdX = this.boardWidth / 8;
  birdY = this.boardHeight / 2;
  bird = {
    x: this.birdX,
    y: this.birdY,
    width: this.birdWidth,
    height: this.birdHeight,
  };
  birdImg = new Image();

  // pipes
  pipeArray: any[] = [];
  pipeWidth = 64;
  pipeHeight = 512;
  pipeX = this.boardWidth;
  pipeY = 0;
  hue = 0;

  pipeImageTop = new Image();
  pipeImageBottom = new Image();

  // physics
  velocityX = -2;
  velocityY = 0;
  gravity = 0.4;
  isGameOver = false;
  score = 0;

  @ViewChild('myCanvas', { static: true }) myCanvas!: ElementRef;
  constructor() {
    this.placePipes = this.placePipes.bind(this);
    this.moveBird = this.moveBird.bind(this);
  };

  @HostListener('document:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (
      event.code === 'Space' ||
      event.code == 'ArrowUp'
    ) {
      this.moveBird();
    }
  };

  handleClick() {
    this.moveBird();
  }

  createCanvas() {
    const canvas: HTMLCanvasElement = this.myCanvas.nativeElement;
    const context = canvas.getContext('2d');
    canvas.height = this.boardHeight;
    canvas.width = this.boardWidth;
    if (context) {
      this.birdImg.src = '../assets/bird.png';
      this.birdImg.onload = () => {
        context.drawImage(
          this.birdImg,
          this.bird.x,
          this.bird.y,
          this.bird.width,
          this.bird.height
        );
      };
      requestAnimationFrame(() => this.update(canvas, context));
    }
    setInterval(this.placePipes, 2000);
  };

  ngOnInit(): void {
    this.createCanvas();
  };

  update(canvas: any, context: any) {
    requestAnimationFrame(() => this.update(canvas, context));
    if (this.isGameOver) {
      return;
    }
    // clear drawing
    context?.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // bird
    this.velocityY += this.gravity;
    this.bird.y = Math.max(this.bird.y + this.velocityY, 0);
    context?.drawImage(
      this.birdImg,
      this.bird.x,
      this.bird.y,
      this.bird.width,
      this.bird.height
    ); 

    if (this.bird.y > this.myCanvas.nativeElement.height) {
      this.isGameOver = true;
    };
    for (let i = 0; i < this.pipeArray.length; i++) {
      this.hue++
      let pipe = this.pipeArray[i];
      pipe.x += this.velocityX;
      let color = 'hsla(' + this.hue + ', 100%, 50%, 10)'
      context.fillStyle = color;
      context.fillRect(pipe.x, pipe.y, pipe.width, pipe.height)

      if (!pipe.passed && this.bird.x > pipe.x + pipe.width) {
        this.score += 0.5;
        pipe.passed = true;
      }
      if (this.detectCollision(this.bird, pipe)) {
        this.isGameOver = true;
      }
    };

    // clear the pipe
    while (this.pipeArray.length > 0 && this.pipeArray[0].x < -this.pipeWidth) {
      this.pipeArray.shift();
    }

    // score
    context.fillStyle = "white";
    context.font = '20px sans-serif';
    context?.fillText(this.score.toString(), 20, 45);

    //game over
    if (this.isGameOver) {
      context?.fillText('GAME OVER!', 20 , 75);
    }
  };

  placePipes() {
    if (this.isGameOver) {
      return;
    }
    let randomPipeY =
      this.pipeY - this.pipeHeight / 4 - Math.random() * (this.pipeHeight / 2);
    let openingSpace = this.myCanvas.nativeElement.height / 4;
    let topPipe = {
      x: this.pipeX,
      y: randomPipeY,
      width: this.pipeWidth,
      height: this.pipeHeight,
      passed: false,
      color: this.hue
    };
    this.pipeArray.push(topPipe);

    let bottomPipe = {
      x: this.pipeX,
      y: randomPipeY + this.pipeHeight + openingSpace,
      width: this.pipeWidth,
      height: this.pipeHeight,
      passed: false,
      color: this.hue
    };
    this.pipeArray.push(bottomPipe);
  };

  moveBird() {
    this.velocityY = -6;
    if (this.isGameOver) {
      this.bird.y = this.birdY;
      this.pipeArray = [];
      this.score = 0;
      this.isGameOver = false;
    }
  };

  detectCollision(a: any, b: any) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };
}
