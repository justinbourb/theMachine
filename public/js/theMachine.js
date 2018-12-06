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
* 2) heatManual button should be on top of + - button
* 3) + - buttons should have functionality (add or remove workers)
*  3a) for that matter, I need to add workers...
* 4) create a loop to toggle visibilty from an array or Id's, less lines of code
* 5) make automationButton() work for any automate button pushed, not with hard coded Id names
**/

let theMachine = {
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
      theMachine.pauseResume();
    //case 2: starting automation
    } else {
      event.toElement.innerText = "Disable Automation";
      document.getElementById(resource + '+').style.display = 'inline-block';
      document.getElementById(resource + '+').style.marginLeft = "12.5%";
      document.getElementById(resource + '-').style.display = 'inline-block';
      document.getElementById(resource + 'Rate').style.visibility = 'visible';
      document.getElementById(resource + 'Time').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.display = 'none';
      theMachine.pauseResume();
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
      conditions[resource][resource + "CounterElement"] = document.getElementById(resource + "Counter");
      conditions[resource][resource+ "CounterElementManual"] = document.getElementById(resource + "CounterManual");
      conditions[resource].duration = conditions[resource].endValue / conditions[resource].ratePerSecond;
    });
    
    
    //TODO: what is initiating with more than just heat? Will theMachine.updateCounter still work properly?
    theMachine.updateCounter();
    
  },
//TODO: refactor / understand better countUp.pauseResume.  I would like to be able to pause a variable submitted to the function call.
  pauseResume() {
    heatAnim.pauseResume();
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
    * this function will increase the heat capacity by +10  or rate/second by 1 each time it is called
    * depending which element is clicked in the DOM
    **/
    let resource;
    //allows user defined element to be used
    if (!optionalElement){
     optionalElement = conditions.heat.heatCounterElement;
    }
    
    //skips event logic if called by theMachine.init();
    //Case 1: called from DOM via a button click
    if (event) {
      resource = event.target.dataset.resource; //heat or tanks or fuel, etc
      //gather current state information from the DOM
      conditions[resource].startValue = parseInt(document.getElementById(resource + 'Counter').innerHTML.split("/")[0].trim());
      if (event.target.innerHTML === 'Item Capacity') {
        conditions[resource].endValue = parseInt(document.getElementById(resource + 'Counter').innerHTML.split("/")[1].trim())+10;
      } else {
        conditions[resource].endValue = parseInt(document.getElementById(resource + 'Counter').innerHTML.split("/")[1].trim());
      }
      //check if enough heat to upgrade speed
      if (event.target.innerHTML === 'Job Speed' && conditions[resource].startValue > conditions[resource].rateCost) {
        //current rate
        conditions[resource].ratePerSecond = parseFloat(document.getElementById(resource + 'Rate').innerHTML.split("/")[1].split(" ")[1]);
        //increase 10%
        conditions[resource].ratePerSecond += (conditions[resource].ratePerSecond * 0.1);
        conditions[resource].ratePerSecond = parseFloat(conditions[resource].ratePerSecond.toFixed(4));
        conditions[resource].startValue -= conditions[resource].rateCost;
        conditions[resource].rateCost += (conditions[resource].rateCost * 0.1);

      } 
      conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / conditions[resource].ratePerSecond;
      //reset previous animation, because it will continue to run in the background otherwise
      heatAnim.reset();
    //Case 2: called without event, which means it was from init()
    //FIXME: will this need to be fixed if more than just heat present?  ie user loads a game
    } else {
      resource = "heat";
    }

    //call a new animation with updated values
    heatAnim = new CountUp(optionalElement, conditions[resource].startValue, conditions[resource].endValue, 0, conditions[resource].duration, {useEasing:false, suffix: ' / '+ conditions[resource].endValue, gradientColors: conditions[resource].gradientColors, ratePerSecond: conditions[resource].ratePerSecond});
    if (!heatAnim.error) {
        window.onload = heatAnim.start();
    } else {
        console.error(heatAnim.error);
    }
  }
}

theMachine.init();

