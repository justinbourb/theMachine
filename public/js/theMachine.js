/**
*TODO: 
*1) add workers to automate processes
*  1a) add a variable activeHeatWorkers = 0
*    1a1) if zero ratePerSecond = 0 // only add heat by clicking button
*    1a2) if (activeHeatWokers >= 1) { ratePerSecond = ratePerSecond * activeHeatWorkers } // or some such
*  1b) if no workers => stop countUp and add a button to increase heat by one unit
*    1b1) determine what this unit would be (heat/second to heat/click converstion???)
*      1b1a) something based on rateCost / level?  
        1b1a1) rateCost level 1 = 1 heat, rateCost level 100 = 5,000,000 heat // or some such
*2) add containers (requirement to increase capacity)
*  2a) reduce heatRatePerSecond by containerPerSecondHeatCost
*    2a1) somehow balance both counters
*      2a1a) if (containerPerSecondHeatCost > 0) {
*               heatRatePerSecond -= containerPerSecondHeatCost
*               }
*               numAnim = new Countup //etc, etc
*3) what to store in local storage??
*  3a) I want to be able to continue the game each time browser is opened
*    3a1) save data on close?  Save any other times or irrelevant? 
*      3a1a) Save data on close completed.  Is this best practice?
*    3b) save timestamp to calculate how much progress has been made (or lost)
*        since last login.  (timestampeCurrentTime - timestampBrowserClosed = timeDifference)
*    3c) each button / attribute should have a level associated with it.
*        ratePerSecond = {rate: 1, level: 1)
*     
**/



let conditions = (
  {heat: {ratePerSecond: 0.5, rateCost: 6, startValue: 0, endValue: 10, duration: "", gradientColors: ["white", "#F5F5F5"], heatCounterElement: "", heatCounterElementManual: ""}}
  );
let heatAnim; //heat CountUp animation
let heatAnimManual; //manual heat CountUp animation


/**TODO:
* 1) continue to build out functionality of automationButton() to match theMachine android app
* 2) manualHeat button should be on top of + - button
* 3) + - buttons should have functionality (add or remove workers)
*  3a) for that matter, I need to add workers...
* 4) create a loop to toggle visibilty from an array or Id's, less lines of code
* 5) make automationButton() work for any automate button pushed, not with hard coded Id names
**/

let theMachine = {
  automationButton: function(event) {
    //case 1: stopping automation
    if (event.toElement.innerText === "Disable Automation"){
      event.toElement.innerText = "Enable Automation";
      document.getElementById('heat+').style.display = 'none';
      document.getElementById('heat-').style.display = 'none';
      document.getElementById('heat-rate').style.visibility = 'hidden';
      document.getElementById('heat-time').style.visibility = 'hidden';
      document.getElementById('manualHeat').style.display = 'inline';
      document.getElementById('manualHeat').style.visibility = 'visible';
      document.getElementById('manualHeat').style.width = '48px';
      document.getElementById('manualHeat').style.marginLeft = "12.5%";
      theMachine.pauseResume();
    //case 2: starting automation
    } else {
      event.toElement.innerText = "Disable Automation";
      document.getElementById('heat+').style.display = 'inline-block';
      document.getElementById('heat+').style.marginLeft = "12.5%";
      document.getElementById('heat-').style.display = 'inline-block';
      document.getElementById('heat-rate').style.visibility = 'visible';
      document.getElementById('heat-time').style.visibility = 'visible';
      document.getElementById('manualHeat').style.display = 'none';
      
      theMachine.pauseResume();
    }
  },
  
  bindEvents: function() {
    /** this event listener creates a local storage item every time the page is left
    *   while this is good in theory for production, it's bad for testing.
    *  Currently disabled.
    **/
    
    /** window.addEventListener('beforeunload', function() {
    *   theMachine.store('theMachine', conditions);
    * });  
    **/
  },
  
  init:function() {
    theMachine.bindEvents();
    
    //check if any data is stored from a previous session
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');  
    }
    
    //add calculated values (cannot be assigned during object creation, it causes an error)
    conditions.heat.heatCounterElement = document.getElementById("heat-counter");
    conditions.heat.heatCounterElementManual = document.getElementById("heat-counter-manual");
    conditions.heat.duration = conditions.heat.endValue / conditions.heat.ratePerSecond;
    
    // heatAnim = new CountUp(conditions.heat.heatCounterElement, conditions.heat.startValue, conditions.heat.endValue, 0, conditions.heat.duration, {useEasing:false, suffix: ' / '+ conditions.heat.endValue, gradientColors: conditions.heat.gradientColors, ratePerSecond: conditions.heat.ratePerSecond});
    // if (!heatAnim.error) {
    //     window.onload = heatAnim.start();
    // } else {
    //     console.error(heatAnim.error);
    // }
    theMachine.updateCounter();
    
  },
//TODO: refactor / understand better countUp.pauseResume.  I would like to be able to pause a variable submitted to the function call.
  pauseResume: function() {
    heatAnim.pauseResume();
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
  
  updateCounter: function(event, optionalElement) {
    /**
    * this function will increase the heat capacity by +10  or rate/second by 1 each time it is called
    * depending which element is clicked in the DOM
    **/
    
    //allows user defined element to be used
    if (!optionalElement){
     optionalElement = conditions.heat.heatCounterElement;
    }
    
    //skips event logic if called by theMachine.init();
    if (event) {
      //gather current state information from the DOM
      conditions.heat.startValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[0].trim());
      if (event.target.innerHTML === 'Item Capacity') {
        conditions.heat.endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim())+10;
      } else {
        conditions.heat.endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim());
      }
      //check if enough heat to upgrade speed
      if (event.target.innerHTML === 'Job Speed' && conditions.heat.startValue > conditions.heat.rateCost) {
        //current rate
        conditions.heat.ratePerSecond = parseFloat(document.getElementById('heat-rate').innerHTML.split("/")[1].split(" ")[1]);
        //increase 10%
        conditions.heat.ratePerSecond += (conditions.heat.ratePerSecond * 0.1);
        conditions.heat.ratePerSecond = parseFloat(conditions.heat.ratePerSecond.toFixed(4));
        conditions.heat.startValue -= conditions.heat.rateCost;
        conditions.heat.rateCost += (conditions.heat.rateCost * 0.1);

      } 
      conditions.heat.duration = (conditions.heat.endValue - conditions.heat.startValue) / conditions.heat.ratePerSecond;
      //reset previous animation, because it will continue to run in the background otherwise
      heatAnim.reset();
    }

    //call a new animation with updated values
    heatAnim = new CountUp(optionalElement, conditions.heat.startValue, conditions.heat.endValue, 0, conditions.heat.duration, {useEasing:false, suffix: ' / '+ conditions.heat.endValue, gradientColors: conditions.heat.gradientColors, ratePerSecond: conditions.heat.ratePerSecond});
    if (!heatAnim.error) {
        window.onload = heatAnim.start();
    } else {
        console.error(heatAnim.error);
    }
  }
}

theMachine.init();

