// ////  Page-scoped globals  ////
// let Sound = new Audio; 
// Sound = $('#croak');

// Counters
let throwingItemIdx = 1;
let score = 0; // I added
let beadCount = 0; // I added
let candyCount = 0; // I added

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2; // TBD: change back to 2
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;

////  Functional Code  ////

// Main
$(document).ready( function() {
  console.log("Ready!");

  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;
  // Set global handles (now that the page is loaded)
  splashScreen = $('#splashScreen');
  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  beadsCounter = $('#beadsCounter');
  candyCounter = $('#candyCounter');
  player = $('#player');  // set the global player handle
  tempPlayer = $('#tempPlayer');
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");
  openSettings = $('.openSettings');
  settingsPanel = $('.settingsPanel');
  saveAndClose = $('.saveAndClose');
  discardAndClose = $('.discardAndClose');
  frequency = $('#frequency');


  // Set global positions
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  gwhGame.css("visibility", "hidden");
  splashScreen.css("visibility", "visible");

  // Splash Screen
  setTimeout(() => { 
    gwhGame.css("visibility", "visible");
    splashScreen.css("visibility", "hidden");

    $(window).keydown(keydownRouter);

    startParade();

  }, 3000);   // Displays Splash Screen for 3 seconds

  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
  
  openSettings.click(OpenSettings);

  discardAndClose.click(Discard);

  saveAndClose.click(Save);
});

function OpenSettings() {
  openSettings.css("visibility", "hidden");
  settingsPanel.css ("visibility", "visible");
}
 
function Discard() {
  frequency.val(currentThrowingFrequency);
  openSettings.css("visibility", "visible");
  settingsPanel.css ("visibility", "hidden");
}

function Save() {
  let objFrequency = parseInt(frequency.val());
  if (frequency.val() < 100) {
    alert('Frequency must be a number greater than or equal to 100');
  }
  else {
    currentThrowingFrequency = objFrequency;
    clearInterval(createThrowingItemIntervalHandle);
    createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
    openSettings.css("visibility", "visible");
    settingsPanel.css ("visibility", "hidden");
  }
}

function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

function checkCollisions(object) {
  // If collided
  if(isColliding(object, player) && !object.prop('collided')) {
    console.log(object);

    // Marks as collided
    object.prop('collided', true);

    // Adds yellow circle
    object.css("background-color", "yellow");
    object.css("border-radius","50%");

    // Increases the score
    gwhScore.text(parseInt(gwhScore.text()) + SCORE_UNIT);
    if (object.hasClass("beads")){
      beadsCounter.text(parseInt(beadsCounter.text())+1);
    }
    else {
      candyCounter.text(parseInt(candyCounter.text()) + 1);
    }

    // Yellow circle and object disappears after 1 second
    object.fadeTo(1000, 0, function() {
      $(this).remove();
    });

    // Plays sound
    // Sound = new sound("croak.wav");
    // Sound.play();

  }
}

// function playAudio() {
//   Sound.play();
// }

// Check if two objects are colliding
function isColliding(o1, o2) {
  const o1D = { 'left': o1.offset().left,
        'right': o1.offset().left + o1.width(),
        'top': o1.offset().top,
        'bottom': o1.offset().top + o1.height()
      };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
      };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}

function createThrowingItem(){

  let whichItem = getRandomNumber(0, 3);
  let objThrown;

  // Creates beads
  if (whichItem < 2) {
    let html =  createItemDivString(throwingItemIdx, "beads", "beads.png");
    ++throwingItemIdx;
    objThrown = $(html).appendTo("#actualGame");
    objThrown.children().css("width", "40px");
    objThrown.children().css("height", "40px");
  }
  // Creates candy
  else {
    let html =  createItemDivString(throwingItemIdx, "candy", "candy.png");
    ++throwingItemIdx;
    objThrown = $(html).appendTo("#actualGame");
    objThrown.children().css("width", "46px");
    objThrown.children().css("height", "40px");
  }
  
  // Sets initial location
  objThrown.css("position","absolute");
  objThrown.css('right', paradeFloat2.css('right'));
  objThrown.css('top', '225px');

  // Calculates above or below
  let signX = Math.round(Math.random()) * 2 - 1;
  let signY = Math.round(Math.random()) * 2 - 1;

  if (signX > 0 && signY > 0) {   // X & Y are positive
    signX = getRandomNumber(5,20);
    signY = getRandomNumber(5,20)
    updateThrownItemPosition(objThrown, signX, signY, 10);
  }
  else if (signX > 0 && signY < 0) {  // X is positive & Y is negative
    signX = getRandomNumber(5,20);
    signY = getRandomNumber(-20,-5);
    updateThrownItemPosition(objThrown, signX, signY, 10);
  }
  else if (signX < 0 && signY > 0) {  // X is negative & Y is positive
    signX = getRandomNumber(-20,-5);
    signY = getRandomNumber(5,20);
    updateThrownItemPosition(objThrown, signX, signY, 10);
  }
  else {  // X & Y are negative
    signX = getRandomNumber(-20,-5);
    signY = getRandomNumber(-20,-5);
    updateThrownItemPosition(objThrown, signX, signY, 10);
  }

  setInterval(function() {
    checkCollisions(objThrown);
  }, 100);

}

// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='throwingItem " + type + "'><img src='img/" + imageString + "'/></div>";
}

function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft){


  let xPos = parseInt(elementObj.css('right'));
  let yPos = parseInt(elementObj.css('top'));

  if ((xPos + xChange < 0) || (xPos + xChange > maxItemPosX) || (yPos + yChange < 0) || (yPos + yChange > maxItemPosY)) {
    setTimeout(graduallyFadeAndRemoveElement, 5000, elementObj);
    return;
  }
  elementObj.css('right', xPos + xChange);
  elementObj.css('top', yPos + yChange);

  if (iterationsLeft > 0) {
    setTimeout(updateThrownItemPosition, OBJECT_REFRESH_RATE, elementObj, xChange, yChange, iterationsLeft-1);
  }
  else {
    setTimeout(graduallyFadeAndRemoveElement, 5000, elementObj);
  }

}

function graduallyFadeAndRemoveElement(elementObj){
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function(){
    $(this).remove();
  });
}

function startParade(){
  console.log("Starting parade...");
  paradeTimer = setInterval( function() {
      // (Depending on current position) update left value for each parade float
      let newPos1 = parseInt(paradeFloat1.css('left'))+FLOAT_SPEED;
      paradeFloat1.css('left', newPos1);
      let newPos2 = parseInt(paradeFloat2.css('left'))+FLOAT_SPEED;
      paradeFloat2.css('left', newPos2);
      if (newPos1 > $('.game-window').width()) {
        paradeFloat1.css('left', 0 - FLOAT_1_WIDTH);
        paradeFloat2.css('left', 0);
      }
      // If player hits alligator float
      if (isColliding(paradeFloat2, player)) {
        // Current speeds of both floats
        let currentPos1 = parseInt(paradeFloat1.css('left'))-FLOAT_SPEED;
        let currentPos2 = parseInt(paradeFloat2.css('left'))-FLOAT_SPEED;
        paradeFloat1.css('left', currentPos1);
        paradeFloat2.css('left', currentPos2);

      }
  }, OBJECT_REFRESH_RATE);
}

// Handle player movement events
function movePerson(arrow) {

  let leftPos = parseInt(player.css('left'));
  let topPos = parseInt(player.css('top'));
  switch (arrow) {

    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      // else if (isColliding(player, paradeFloat1) || isColliding(player, paradeFloat2)) {
      //   newPos = parseInt(player.css('left'))+PERSON_SPEED;
      // }
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      // else if (isColliding(player, paradeFloat1) || isColliding(player, paradeFloat2)) {
      //   newPos = parseInt(player.css('right'))-PERSON_SPEED;
      // }
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0 && !isColliding(player, paradeFloat1) && !isColliding(player, paradeFloat2)) {
        newPos = 0;
      }
      // else if (isColliding(player, paradeFloat1) || isColliding(player, paradeFloat2)) {
      //   newPos = parseInt(player.css('top'))+PERSON_SPEED;
      // }
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY && !isColliding(player, paradeFloat1) && !isColliding(player, paradeFloat2)) {
        newPos = maxPersonPosY;
      }
      // else if (isColliding(player, paradeFloat1) || isColliding(player, paradeFloat2)) {
      //   newPos = parseInt(player.css('up'))-PERSON_SPEED;
      // }
      player.css('top', newPos);
      break;
    }
  }
  if (isColliding(player, paradeFloat1) || isColliding(player, paradeFloat2)) {
    player.css('top', topPos);
    player.css('left', leftPos);
  }
}