/// <reference path="../typings/index.d.ts" />

import PIXI = require('pixi.js');
const renderer:PIXI.WebGLRenderer = new PIXI.WebGLRenderer(1280, 780);
document.body.appendChild(renderer.view);

/*
 Programming challenge test created by Brian Howell 3/17/2017;
*/

// You need to create a root container that will hold the scene you want to draw.
const stage:PIXI.Container = new PIXI.Container();

var masterArray = [];
var xyArray = [];
var hopHistory = [];
var checkerStartPos = 0;
var max_x = 0;
var max_y = 0;
var numberOfSquares = 36;
var block_size = 102;
var RowAmount = Math.sqrt(numberOfSquares);
var startStop = true;

//checker image;
var checker = new PIXI.Sprite(PIXI.Texture.fromImage('images/checker.png'));

var blocks = new PIXI.Sprite(PIXI.Texture.fromImage('images/up_arrow.jpg'));

var _run = PIXI.Texture.fromImage('images/run.jpg');
var _pause = PIXI.Texture.fromImage('images/pause.jpg');
var pauseBtn = new PIXI.Sprite(_pause);

//some audio;
var bloop = new Audio('audio/FX_Bloop.mp3');
var blip = new Audio('audio/FX_Blip.mp3');
//some text
var style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fontStyle: 'italic',
  //fontWeight: 'bold',
  fill: ['#ffffff', '#00ff99'], // gradient
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440
});
var basicText = new PIXI.Text('Click checker to start.\n\nClick shuffle to restart.',style);
basicText.x = 100;
basicText.y = 120;

//load UI images;
addStopUI();
addshuffleUI();
add5x5UI();
add6x6UI();

buildBoard();
addTextUI();

animate();

function animate() {
  // start the timer for the next animation loop
  requestAnimationFrame(animate);
    // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage);
}

// main function for moving the checker based on arrow direction;
function startMoving(){
  if(startStop){
    moveChecker(masterArray,checkerStartPos);
    // set move rate to half a second;
    setTimeout(startMoving,500);
  }
}

function addTextUI(){
  //load start text instructions;
  stage.addChild(basicText);
}

function addStopUI(){
  pauseBtn.position.x = 120;
  pauseBtn.position.y = 10;
  pauseBtn.interactive = true;
  pauseBtn.buttonMode = true;
  pauseBtn.on('pointerdown', pause);
  stage.addChild(pauseBtn);
}

function addshuffleUI(){
  var _shuffle = PIXI.Texture.fromImage('images/shuffle.jpg');
  var btn = new PIXI.Sprite(_shuffle);
  btn.position.x = 250;
  btn.position.y = 10;
  btn.interactive = true;
  btn.buttonMode = true;
  btn.on('pointerdown', buildBoard);
  stage.addChild(btn);
}

function add5x5UI(){
  var _5x5 = PIXI.Texture.fromImage('images/5x5.jpg');
  var btn = new PIXI.Sprite(_5x5);
  btn.position.x = 400;
  btn.position.y = 10;
  btn.interactive = true;
  btn.buttonMode = true;
  btn.on('pointerdown', fiveBy);
  stage.addChild(btn);
}

function add6x6UI(){
  var _6x6 = PIXI.Texture.fromImage('images/6x6.jpg');
  var btn = new PIXI.Sprite(_6x6);
  btn.position.x = 500;
  btn.position.y = 10;
  btn.interactive = true;
  btn.buttonMode = true;
  btn.on('pointerdown', sixBy);
  stage.addChild(btn);
}

function buildBoard(){

  // remove all sprites after the UI buttons;
  removeRange(4,numberOfSquares+6);
  xyArray = [];
  // Create a grid of squares;
  for (var i = 0; i < numberOfSquares; i++) {
      //replace the arrow image based on the random selecton 0-3;
      blocks = loadRandomArrow(i);
      blocks.anchor.set(0);
      blocks.position.x = ((i % RowAmount) * block_size)+20;
      blocks.position.y = (Math.floor(i / RowAmount) * block_size)+40;
      xyArray[i] = [blocks.position.x,blocks.position.y]
      stage.addChild(blocks);
  }
  // store the max positions for limits;
  max_x = blocks.position.x;
  max_y = blocks.position.y;

  addChecker();

}

function loadRandomArrow(blockNum){
  // pick the arrow based on the random number;
  var min = 0;
  var max = 3;
  var aNum = Math.floor(Math.random() * (max - min + 1) + min);
  if(aNum==0){
    masterArray[blockNum] = 0;
    return new PIXI.Sprite(PIXI.Texture.fromImage('images/up_arrow.jpg'));
  }else if(aNum==1){
    masterArray[blockNum] = 1;
    return new PIXI.Sprite(PIXI.Texture.fromImage('images/dn_arrow.jpg'));
  }else if(aNum==2){
    masterArray[blockNum] = 2;
    return new PIXI.Sprite(PIXI.Texture.fromImage('images/left_arrow.jpg'));
  }else if(aNum==3){
    masterArray[blockNum] = 3;
    return new PIXI.Sprite(PIXI.Texture.fromImage('images/right_arrow.jpg'));
  }
};

function addChecker(){
  var ranPos = setRandomStartPoint();
  stage.removeChild(basicText);
  checker.anchor.set(0);
  checker.position.x = ranPos[0]+26;
  checker.position.y = ranPos[1]+46;
  checker.interactive = true;
  checker.buttonMode = true;
  checker.on('pointerdown', startG);
  stage.addChild(checker);
}

function startG(){
  stage.removeChild(basicText);
  startMoving();
}

function pause(){
  if(startStop){
      startStop = false;
      this.texture = _run;
  }else{
    startStop = true;
    this.texture = _pause;
    if(basicText.text == "Lose"){
      basicText.text = "";
      buildBoard();
    }else if(basicText.text == "Win!"){
      basicText.text = "";
      buildBoard();
    }
    startMoving();
  }
  stage.removeChild(basicText);
}

function checkCycling(pos1,pos2){
  var l = 0;
  for (var j=0; j<hopHistory.length; j++) {
      if (hopHistory[j] == pos1) l++;
  }
  if(l > 2){
      hopHistory = [];
      startStop = false;
      pauseBtn.texture = _run;
      basicText.text = "Lose";
      basicText.x = 10;
      basicText.y = 2;
      stage.addChild(basicText);
  }
}

function offTheEdge(){

  blip.play();
  hopHistory = [];
  startStop = false;
  pauseBtn.texture = _run;
  basicText.text = "Win!";
  basicText.x = 10;
  basicText.y = 2;
  stage.addChild(basicText);
}

function removeRange(s,e){
  // clear the sprites so we can start over;
  stage.removeChildren(s,e);
}

function fiveBy(){
  numberOfSquares = 25;
  RowAmount = Math.sqrt(numberOfSquares);
  removeRange(4,numberOfSquares+6);
  xyArray = [];
  buildBoard();
}

function sixBy(){
  numberOfSquares = 36;
  RowAmount = Math.sqrt(numberOfSquares);
  removeRange(4,numberOfSquares+6);
  xyArray = [];
  buildBoard();
}

function setRandomStartPoint(){
  // returns an array with the x and y location of the random start point;
  var xyArray = [];
  var min = 0;
  var max = numberOfSquares-1;
  var rNum = Math.floor(Math.random() * (max - min + 1) + min);

  for (var i = 0; i < numberOfSquares; i++) {
      if(i == rNum){
        xyArray[0] = ((i % RowAmount) * block_size)+26;
        xyArray[1] = (Math.floor(i / RowAmount) * block_size)+26;
        checkerStartPos = i;
        break;
      }
  }
  return xyArray;
}

function moveChecker(_pos,_checkerStartPos){
  var nPos = xyArray;
  // move checker to a new position based on the index number 0=up 1 = down 2=left 3=right;
    if(_pos[_checkerStartPos] == 0){
      checker.position.y = checker.position.y-block_size;
    }else if(_pos[_checkerStartPos] == 1){
      checker.position.y = checker.position.y+block_size;
    }else if(_pos[_checkerStartPos] == 2){
      checker.position.x = checker.position.x-block_size;
    }else if(_pos[_checkerStartPos] == 3){
      checker.position.x = checker.position.x+block_size;
    }
    //check limits. If it goes off the board add a new checker in a random positon;
    if(checker.position.x > max_x+block_size){
      offTheEdge();
      return;
    }else if(checker.position.y > max_y+block_size){
      offTheEdge();
      return;
    }else if(checker.position.x < 0){
      offTheEdge();
      return;
    }else if(checker.position.y < 0){
      offTheEdge();
      return;
    }

    for(var i=0;i<xyArray.length;i++){
      var posXY = xyArray[i];
      //determine the arrow block index number based on the new x y position of the checker;
      if((posXY[0] <=checker.position.x && checker.position.x <= posXY[0] + block_size) && (posXY[1] <=checker.position.y && checker.position.y <= posXY[1] + block_size)){
        //set the new index position value;
        checkerStartPos = i;
        hopHistory.push(i);
        bloop.play();
        break;
      }
    }

  var count = checkCycling(_checkerStartPos,i);

}
