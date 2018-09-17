//######## start of counter code ##########
//the counter use countUp.js

  var heatCounter = document.getElementById("heat-counter");
  //CountUp params element,start value, end value, number of decimals, duration, options object
  var startValue = 0;
  var endValue = 200;
  var duration = 100;
  var numAnim = new CountUp(heatCounter, startValue, endValue,0,duration,{useEasing:false, suffix: ' / '+ endValue});
  if (!numAnim.error) {
      window.onload=numAnim.start();
  } else {
      console.error(numAnim.error);
  }

//######## end of counter code ##########
