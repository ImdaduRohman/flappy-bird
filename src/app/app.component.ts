import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fb';

  constructor() {
    this.placePipes = this.placePipes.bind(this);
    this.moveBird = this.moveBird.bind(this);
  };

  ngOnInit(): void {
    this.createCanvas();
  };

  // canvas
  boardWidth = 360;
  boardHeight = 640;

  // bird
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
  powImg = new Image();

  // pipes
  pipeArray: any[] = [];
  pipeWidth = 100;
  pipeHeight = 512;
  pipeX = this.boardWidth;
  pipeY = 0;
  hue = 0;

  // physics
  velocityX = -4;
  velocityY = 0;
  gravity = 0.4;
  isGameOver = false;
  score = 0;
  topScore = { beginner: 0, medium: 0, hard: 0 };

  //modal
  level = 'BEGINER';
  handleBeginer() {
    this.velocityX = -4;
    this.level = 'BEGINER';
    this.moveBird();
  };

  handleMedium() {
    this.velocityX = -6;
    this.level = 'MEDIUM';
    this.moveBird();
  };

  handleHard() {
    this.velocityX = -10;
    this.level = 'HARD';
    this.moveBird();
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
  };

  createCanvas() {
    const canvas: HTMLCanvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
    canvas.height = this.boardHeight;
    canvas.width = this.boardWidth;
    const context = canvas.getContext('2d');
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
      this.powImg.src = '../assets/pow.png';
      requestAnimationFrame(() => this.update(canvas, context));
    }
    setInterval(this.placePipes, 1500);
    const ls =localStorage.getItem('topScore');
    if(ls) {
      const value = JSON.parse(ls);
      if(value) {
        this.topScore = value;
      }
    } else {
      localStorage.setItem('topScore', JSON.stringify(
        { 'beginner': 0, 'medium': 0, 'hard': 0 }
      ));
    }
  };

  update(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
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

    //background
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        var x = Math.floor(Math.random() * canvas.width);
        var y = Math.floor(Math.random() * canvas.height);
        var r = Math.floor( Math.random() * (30 - 5) + 5 );
        context.beginPath();
        context.strokeStyle = 'hsla(' + this.hue+3 + ', 100%, 50%)';
        context.arc(x, y, r, 0, 2*Math.PI);
        context.stroke();
      }
    };

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

    if (this.bird.y > this.boardHeight) {
      this.isGameOver = true;
    };

    for (let i = 0; i < this.pipeArray.length; i++) {
      let pipe = this.pipeArray[i];
      pipe.x += this.velocityX;
      context.fillStyle = 'hsla(' + this.hue + ', 100%, 50%, 10)';
      context.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
      let retrievedTopcore = (localStorage.getItem('topScore'));
      if (!pipe.passed && this.bird.x > pipe.x + pipe.width) {
        this.score += 0.5;
        pipe.passed = true;
        if(retrievedTopcore){
          const beginner = JSON.parse(retrievedTopcore).beginner;
          const medium = JSON.parse(retrievedTopcore).medium;
          const hard = JSON.parse(retrievedTopcore).hard;
          if(this.score > beginner && this.level === 'BEGINER') {
            this.topScore = {...this.topScore, 'beginner': this.score};
            localStorage.setItem('topScore', JSON.stringify(this.topScore));
          }
          if(this.score > medium && this.level === 'MEDIUM') {
            this.topScore = {...this.topScore, 'medium': this.score};
            localStorage.setItem('topScore', JSON.stringify(this.topScore));
          }
          if(this.score > hard && this.level === 'HARD') {
            this.topScore = {...this.topScore, 'hard': this.score};
            localStorage.setItem('topScore', JSON.stringify(this.topScore));
          }
        }
      }
      if (this.detectCollision(this.bird, pipe)) {
        this.isGameOver = true;
      }
    };
    this.hue++

    // clear the pipe
    while (this.pipeArray.length > 0 && this.pipeArray[0].x < -this.pipeWidth) {
      this.pipeArray.shift();
    }

    // score
    {if(!this.isGameOver) {
      context.fillStyle = "white";
      context.font = '20px sans-serif';
      context?.fillText(this.score.toString(), 20, 45);
    }};

    //game over
    if (this.isGameOver) {
      context?.drawImage(this.powImg, this.bird.x + 15, this.bird.y-3, this.birdWidth*1.5, this.birdHeight*1.5);
    };
  };

  placePipes() {
    if (this.isGameOver) {
      return;
    }
    let randomPipeY =
      this.pipeY - this.pipeHeight / 4 - Math.random() * (this.pipeHeight / 2);
    let openingSpace = this.boardHeight / 4;
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

  detectCollision(
    bird: {x: number, width: number, y: number ,height: number}, 
    pipe: {x: number, width: number, y: number, height: number}
  ) {
    return (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.y + pipe.height &&
      bird.y + bird.height > pipe.y
    );
  };
}
