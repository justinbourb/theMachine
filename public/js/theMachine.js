//######## start of heat counter code ##########
//the  counter use countUp.js

  var heatCounter = document.getElementById("heat-counter");
  //CountUp params element,start value, end value, number of decimals, duration, options object
  var startValue = 0;
  var endValue = 10;
  var ratePerSecond = 1;
  var duration = endValue / ratePerSecond;
  var numAnim = new CountUp(heatCounter, startValue, endValue,0,duration,{useEasing:false, suffix: ' / '+ endValue, gradientColors: ["white", "#F5F5F5"], ratePerSecond: ratePerSecond});
  if (!numAnim.error) {
      window.onload=numAnim.start();
  } else {
      console.error(numAnim.error);
  }

//######## end of heat counter code ##########

  //I don't remember why this is here?
  var heatRate = document.getElementById("heat-rate");

function pause(){
  numAnim.pauseResume();
};


//TODO: combine increaseCapacity and increaseEfficiency into one function that takes parameters from the button clicked
// since these two functions have so much in common, it's likely possible to combine into one function for all use cases?

//TODO: the approach of calling a new CountUp animation for each change in critea leads to a proliferation of CountUp objects
//running in the background, each time a button is clicked a new counter starts running and the previous counter keeps running
//in the background.
//
//Solution A: .reset() all possible combinations of previous counters running - this sounds like it would require
//a very long list of .reset() calls and possibly prone to errors (miss a counter or a type or some such)
//note: .reset() does not seem to be working probably due to scope issues (called inside function, not accessible outside)
//.reset() works fine on global CountUp, but not within function
// use .this syntax?? see https://stackoverflow.com/questions/13218472/calling-a-function-defined-inside-another-function-in-javascript
//
//Solution B: update CountUp.update() function from it's current state of only updating endVal
//future .update() state would accept which critera you want to update and update appropriately
//use the default options approach similar to main CountUp code?
//example:
//if options object is not defined nothing happens
//if options.endVal is defined old endVal is deleted and new endVal is used in it's place.
//
//Solution C: call numAnim from global scope instead of creating a new CountUp object inside local scope

function itemCapacity(){
  //this function will increase the heat capacity by +10 each time it is called
  
  //gather current state information from the DOM
  var startValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[0].trim());
  var endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim())+10;
  var ratePerSecond = parseInt(document.getElementById("heat-rate").innerHTML.split(" ")[1].trim());
  var duration = endValue / ratePerSecond;
  //reset previous animation, because it will continue to run in the background otherwise
 numAnim.reset();

  //call a new animation with updated values
  numAnim = new CountUp(heatCounter, startValue, endValue,0,duration,{useEasing:false, suffix: ' / '+ endValue, gradientColors: ["white", "#BEBEBE"], ratePerSecond: ratePerSecond});
  if (!numAnim.error) {
      window.onload=numAnim.start();
  } else {
      console.error(numAnim.error);
  }
};

function jobSpeed(){
  //this function will increase the ratePerSecond by +1 each time it is called
  
  //gather current state information from the DOM
  var startValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[0].trim());
  var endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim());
  var ratePerSecond = parseInt(document.getElementById("heat-rate").innerHTML.split(" ")[1].trim())+1;
  var duration = (endValue-startValue) / ratePerSecond;
  //reset previous animation, because it will continue to run in the background otherwise
    numAnim.reset();
  //call a new animation with updated values
  numAnim = new CountUp(heatCounter, startValue, endValue,0,duration,{useEasing:false, suffix: ' / '+ endValue, gradientColors: ["white", "#F5F5F5"], ratePerSecond: ratePerSecond});
  if (!numAnim.error) {
      window.onload=numAnim.start();
  } else {
      console.error(numAnim.error);
  }
}