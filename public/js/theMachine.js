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


  var heatRate = document.getElementById("heat-rate");
