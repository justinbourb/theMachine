let conditions;
let rateCost;
let duration;
let endValue;
let heatCounter;
let numAnim;
let ratePerSecond;
let startValue;
let store;


let theMachine = {
  
  init:function() {
    
    //this function will initialize the counter using numAnim
    if (!conditions) {
      //TODO: create a system to store data in conditions variable instead of accessing data from DOM
      conditions = theMachine.store('theMachcine');
      heatCounter = document.getElementById("heat-counter");
      rateCost = 6;
      //CountUp params element,start value, end value, number of decimals, duration, options object
      startValue = 0;
      endValue = 10;
      ratePerSecond = 0.5;
      duration = endValue / ratePerSecond;
      numAnim = new CountUp(heatCounter, startValue, endValue, 0, duration, {useEasing:false, suffix: ' / '+ endValue, gradientColors: ["white", "#F5F5F5"], ratePerSecond: ratePerSecond});
      if (!numAnim.error) {
          window.onload = numAnim.start();
      } else {
          console.error(numAnim.error);
      }
    }
  },

  store: function (namespace, data) {
    //this function stores data to the local storage
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      let store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  },

  pause: function() {
    //this function pauses or resume's the countUp animation
    numAnim.pauseResume();
  },

  updateCounter: function(event) {
    /**
    * this function will increase the heat capacity by +10  or rate/second by 1 each time it is called
    * depending which element is clicked in the DOM
    **/

    //gather current state information from the DOM
    startValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[0].trim());
    if (event.target.innerHTML === 'Item Capacity') {
      endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim())+10;
    } else {
      endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim());
    }
    //check if enough heat to upgrade speed
    if (event.target.innerHTML === 'Job Speed' && startValue > rateCost) {
      //current rate
      ratePerSecond = parseFloat(document.getElementById('heat-rate').innerHTML.split("/")[1].split(" ")[1]);
      //increase 10%
      ratePerSecond += (ratePerSecond * 0.1);
      ratePerSecond = parseFloat(ratePerSecond.toFixed(4));
      startValue -= rateCost;
      rateCost += (rateCost * 0.1);
      console.log(rateCost);
      //do nothing if not enough heat
    } else {
      return
    }
    duration = (endValue - startValue) / ratePerSecond;
    //reset previous animation, because it will continue to run in the background otherwise
    numAnim.reset();

    //call a new animation with updated values
    numAnim = new CountUp(heatCounter, startValue, endValue, 0, duration, {useEasing:false, suffix: ' / '+ endValue, gradientColors: ["white", "#BEBEBE"], ratePerSecond:ratePerSecond});
    if (!numAnim.error) {
        window.onload = numAnim.start();
    } else {
        console.error(numAnim.error);
    }
  }
}

theMachine.init();