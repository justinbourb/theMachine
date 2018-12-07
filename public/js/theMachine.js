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
  {heat: {ratePerSecond: 0.5, rateCost: 6, startValue: 0, endValue: 10, duration: "", gradientColors: ["white", "#F5F5F5"], counterElement: "", counterElementManual: ""}}
  );
let heatAnim; //heat CountUp animation
let heatAnimManual; //manual heat CountUp animation


let theMachine = {
  
  /**TODO:
  * 1) continue to build out functionality of automationButton() to match theMachine android app
  * 3) + - buttons should have functionality (add or remove workers)
  *  3a) for that matter, I need to add workers...
  * 4) create a loop to toggle visibilty from an array or Id's, less lines of code (worthwhile?)
  **/
  
  automationButton(event) {
    //case 1: stopping automation
    let resource = event.target.dataset.resource; //heat or tanks or fuel, etc
    if (event.toElement.innerText === "Disable Automation"){
      event.toElement.innerText = "Enable Automation";
      document.getElementById(resource + '+').style.display = 'none';
      document.getElementById(resource + '-').style.display = 'none';
      document.getElementById(resource + 'Rate').style.visibility = 'hidden';
      document.getElementById(resource + 'Time').style.visibility = 'hidden';
      document.getElementById(resource + 'Manual').style.display = 'inline';
      document.getElementById(resource + 'Manual').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.width = '48px';
      document.getElementById(resource + 'Manual').style.marginLeft = "12.5%";
      theMachine.pauseResume(resource + "Counter");
    //case 2: starting automation
    } else {
      event.toElement.innerText = "Disable Automation";
      document.getElementById(resource + '+').style.display = 'inline-block';
      document.getElementById(resource + '+').style.marginLeft = "12.5%";
      document.getElementById(resource + '-').style.display = 'inline-block';
      document.getElementById(resource + 'Rate').style.visibility = 'visible';
      document.getElementById(resource + 'Time').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.display = 'none';
      theMachine.pauseResume(resource + "Counter");
    }
  },
  
  bindEvents() {
    /** this event listener creates a local storage item every time the page is left
    *   while this is good in theory for production, it's bad for testing.
    *  Currently disabled.
    **/
    
    /** window.addEventListener('beforeunload', function() {
    *   theMachine.store('theMachine', conditions);
    * });  
    **/
  },
  
  init() {
    theMachine.bindEvents();
    
    //check if any data is stored from a previous session
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');  
    }
    
    //add calculated values (cannot be assigned during object creation, it causes an error)
    Object.getOwnPropertyNames(conditions).forEach(function(resource){
      conditions[resource]["counterElement"] = document.getElementById(resource + "Counter");
      conditions[resource]["counterElementManual"] = document.getElementById(resource + "CounterManual");
      conditions[resource].duration = conditions[resource].endValue / conditions[resource].ratePerSecond;
    });
    
    
    //TODO: what is initiating with more than just heat? Will theMachine.updateCounter still work properly?
    theMachine.updateCounter();
    
  },
  manualCounterButton(event) {
  /**TODO:
  * 1) build out heatManual button
  *   1a) starts another counter in heatManualCounter on each click of the button
  *    1a1) no effect if counter is in progress (only start new counter after completion)
  *    1a2) update heatCounter +1 each time heatManual button is clicked
  *      1a2a) increase +1 amount based on capacity?? Should level with capacity??
  *            With 10 capacity +1 is a lot.  With 10,000 cap, +1 is nothing. Needs to scale.
  *    1a3) fixed speed for manual regardless of amount?
  */
    let optionalElement = conditions[event.target.dataset.resource]["counterElementManual"]
    //TODO: add +1... add this logic to updateCounter?? (yes I think so, but go through the logic first)
    theMachine.updateCounter(event, optionalElement);
    theMachine.pause();
    
  },

  pauseResume(counter) {
    //This function will pauseResume the desired counter, as stored on the conditions object.
    conditions[counter].pauseResume();
  },
  
  store(namespace, data) {
    //this function stores data to the local storage
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      let store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  },
  
  updateCounter(event, optionalElement) {
    /**
    * Depending which element is clicked in the DOM this function will dynamically: 
    * 1) Increase the capacity by +10 or 
    * 2) Increase rate/second by 1 each time it is called or
    * 3) Manually increase [resource] by x amount (as calculated).
    * 4) Dynamically create a unique CountUp item and store it in the conditions Object
    *
    **/
    let resource;
    let countUpName;
    //allows user defined element to be used
    if (!optionalElement){
     optionalElement = conditions.heat.counterElement;
    }
    //dynamically assign a name to the new CountUp (called later in this function)
    countUpName = optionalElement.id;
    
    //skips event logic if called by theMachine.init();
    //Case 1: called from DOM via a button click
    if (event) {
      resource = event.target.dataset.resource; //heat or tanks or fuel, etc
      //gather current state information from the countUp.js
      conditions[resource].startValue = conditions[countUpName].frameVal;
      if (event.target.innerHTML === 'Item Capacity') {
        conditions[resource].endValue = conditions[countUpName].endVal+10;
      } 
      //check if enough heat to upgrade speed
      if (event.target.innerHTML === 'Job Speed' && conditions[resource].startValue > conditions[resource].rateCost) {
        //increase 10%
        conditions[resource].ratePerSecond += (conditions[resource].ratePerSecond * 0.1);
        conditions[resource].ratePerSecond = parseFloat(conditions[resource].ratePerSecond.toFixed(4));
        conditions[resource].startValue -= conditions[resource].rateCost;
        conditions[resource].rateCost += (conditions[resource].rateCost * 0.1);

      } 
      conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / conditions[resource].ratePerSecond;
      //reset previous animation, because it will continue to run in the background otherwise
      conditions[countUpName].reset();
    //Case 2: called without event, which means it was from init()
    //FIXME: will this need to be fixed if more than just heat present?  ie user loads a game
    } else {
      resource = "heat";
    }
    
    //call a new animation with updated values
    conditions[countUpName] = new CountUp(optionalElement, conditions[resource].startValue, conditions[resource].endValue, 0, conditions[resource].duration, {useEasing:false, suffix: ' / '+ conditions[resource].endValue, gradientColors: conditions[resource].gradientColors, ratePerSecond: conditions[resource].ratePerSecond});
    if (!conditions[countUpName].error) {
        window.onload = conditions[countUpName].start();
    } else {
        console.error(conditions[countUpName].error);
    }
  }
}

theMachine.init();

