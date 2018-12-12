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
  {heat: { counterElement: "", counterElementManual: "", duration: "", endValue: 10, gradientColors: ["white", "#F5F5F5"], paused: false, ratePerSecond: 0.5, rateCost: 6, startValue: 6 }}
  );



let theMachine = {
  
  /**TODO:
  * 3) + - buttons should have functionality (add or remove workers)
  *  3a) for that matter, I need to add workers...
  * 4) create a loop to toggle visibilty from an array or Id's, less lines of code (worthwhile?)
  * 5) add manual resource enabled, disabled checks to updateCounter function
  *  5a) make this it's own function, since it is used in multiple places.
  *    5a1) used in: automationButton, manualCounterButton and updateCounter
  **/
   animateCountUp(countUpName, elemnt, resource) {
    //call a new animation with updated values for automated resources
    conditions[resource][countUpName] = new CountUp(elemnt, conditions[resource].startValue, conditions[resource].endValue, 0, conditions[resource].duration, {useEasing:false, suffix: ' / '+ conditions[resource].endValue, gradientColors: conditions[resource].gradientColors, ratePerSecond: conditions[resource].ratePerSecond});
    if (!conditions[resource][countUpName].error) {
        window.onload = conditions[resource][countUpName].start();
    } else {
        console.error(conditions[resource][countUpName].error);
    }  
  },
  
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
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'block';
      theMachine.pauseResume(resource, resource + "CountUpAnim");
      theMachine.manualCounterButtonStatus(resource);
      conditions[resource].paused = true;
      
      
    //case 2: starting automation
    } else {
      event.toElement.innerText = "Disable Automation";
      document.getElementById(resource + '+').style.display = 'inline-block';
      document.getElementById(resource + '+').style.marginLeft = "12.5%";
      document.getElementById(resource + '-').style.display = 'inline-block';
      document.getElementById(resource + 'Rate').style.visibility = 'visible';
      document.getElementById(resource + 'Time').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.display = 'none';
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'none';
      //check if any resources have been generated manually and start the (updated) counter again
      // conditions[resource][resource + "CountUpAnim"].update(conditions[resource].startValue);
      conditions[resource][resource + "CountUpAnim"].pauseResume(resource, resource + "CountUpAnim");
      conditions[resource].paused = false;
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
  
  checkStartValue(resource) {
    if (conditions[resource][resource + 'CountUpAnim'].frameVal > conditions[resource].startValue) {
        conditions[resource].startValue = conditions[resource][resource + 'CountUpAnim'].frameVal;
      }  
    
  },
  
  init() {
    theMachine.bindEvents();
    
    //check if any data is stored from a previous session
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');  
    }
    
    //add calculated values (cannot be assigned during object creation, it causes an error)
    Object.getOwnPropertyNames(conditions).forEach(function(resource){
      conditions[resource]["counterElement"] = document.getElementById(resource + "CountUpAnim");
      conditions[resource]["counterElementManual"] = document.getElementById(resource + "CountUpAnimManual");
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
    *    1a2) update heatCountUpAnim +1 each time heatManual button is clicked
    *      1a2a) increase +1 amount based on capacity?? Should level with capacity??
    *            With 10 capacity +1 is a lot.  With 10,000 cap, +1 is nothing. Needs to scale.
    *    1a3) fixed speed for manual regardless of amount?
    */
    let resource = event.target.dataset.resource;
    let countUpName = resource + 'CountUpAnimManual';
    let targetElement = document.getElementById(countUpName);
    let startValue = 0;
    let endValue = 100;
    let decimals = 0;
    let duration = conditions[resource].duration/5;
    
    /**When pausing the counter, startValue is not automatically updated.
    *  This could cause a discrepancy when the counter is restarted.
    *  Thus we will match startValue to frameVal before doing +1 to startValue
    **/
    theMachine.checkStartValue(resource);
    //TODO: add +1... add this logic to updateCounter?? (yes I think so, but go through the logic first)
    //parseInt(document.getElementById(resource + "CountUpAnim").innerHTML.split('/')[0])+1;
    conditions[resource][countUpName] = new CountUp(targetElement, startValue, endValue, decimals, duration, {useEasing:false, suffix: ' / '+ '1', gradientColors: conditions[resource].gradientColors});
    if (!conditions[resource][countUpName].error) {
        window.onload = conditions[resource][countUpName].start();
    } else {
        console.error(conditions[resource][countUpName].error);
    }
    //disable button until manual resource generation is finished
    document.getElementById(event.target.id).disabled = true;
    //wait for the manual resource generation to finish
    setTimeout(function() {
      document.getElementById(event.target.id).disabled = false;
      document.getElementById(resource + 'CountUpAnim').innerHTML = (parseInt(document.getElementById(resource + 'CountUpAnim').innerHTML.split('/')[0])+1) + ' / ' + conditions[resource].endValue;
      conditions[resource].startValue += 1;
      console.log(conditions[resource].startValue);}, duration*1000);
    
  },
  
  manualCounterButtonStatus(resource) {
    //User cannot add more resource than maximum (endValue) so disable the manual button.
      if (conditions[resource][resource + 'CountUpAnim'].frameVal === conditions[resource].endValue){
        document.getElementById(resource + 'Manual').disabled = true;
      } else {
        document.getElementById(resource + 'Manual').disabled = false;
      }
  },
    
  pauseResume(resource, counter) {
    //This function will pauseResume the desired counter, as stored on the conditions object.
    conditions[resource][counter].pauseResume();
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
  
  updateCounter(event, elemnt) {
    /**
    * Depending which element is clicked in the DOM this function will dynamically: 
    * 1) Increase the capacity by +10 or 
    * 2) Increase rate/second by 1 each time it is called or
    *
    **/
    
    let resource;
    let countUpName;
    //allows user defined element to be used
    if (!elemnt){
     elemnt = conditions.heat.counterElement;
    }
    
    //skips event logic if called by theMachine.init();
    //Case 1: called from DOM via a button click
    if (event) {
      resource = event.target.dataset.resource; //heat or tanks or fuel, etc
      countUpName = resource + 'CountUpAnim';
      theMachine.checkStartValue(resource);
      
      if (event.target.innerHTML === 'Item Capacity') {
        conditions[resource].endValue = conditions[resource][countUpName].endVal+10;
         if (conditions[resource].paused === true){
          //update DOM when counter is paused;
          let gradientPercent = conditions[resource].startValue / conditions[resource].endValue * 100;
          document.getElementById(resource + 'CountUpAnim').innerHTML = conditions[resource].startValue + " / " + conditions[resource].endValue;
          document.getElementById(resource + 'CountUpAnim').style.backgroundImage="linear-gradient(to right, "+conditions[resource].gradientColors[0]+", "+conditions[resource].gradientColors[0]+" "+gradientPercent+"%, "+conditions[resource].gradientColors[1]+" 1%)";
          conditions[resource][resource + 'CountUpAnim'].endVal = conditions[resource].endValue;
          conditions[resource][resource + 'CountUpAnim'].options.suffix = ' / '+ conditions[resource].endValue;
          /*FIXME:
          *1) update time remaining when paused so it is accurate when resumed.
          *2) currently does not resume counting if adding capacity after reaching capacity.
          *  2a) 20/20 resource -> add capacity while paused -> 20/30 resource and not counting.
          *    2a1) add this logic to pauseResume if startValue = endValue call a new countUp??
          */
          
        }
      } 
      //check if enough heat to upgrade speed
      if (event.target.innerHTML === 'Job Speed' && conditions[resource].startValue >= conditions[resource].rateCost) {
        //increase 10%
        conditions[resource].ratePerSecond += (conditions[resource].ratePerSecond * 0.1);
        conditions[resource].ratePerSecond = parseFloat(conditions[resource].ratePerSecond.toFixed(4));
        conditions[resource].startValue -= conditions[resource].rateCost;
        conditions[resource].rateCost += (conditions[resource].rateCost * 0.1);
        if (conditions[resource].paused === true){
          //update DOM when counter is paused;
          let gradientPercent = conditions[resource].startValue / conditions[resource].endValue * 100;
          document.getElementById(resource + 'CountUpAnim').innerHTML = conditions[resource].startValue + " / " + conditions[resource].endValue;
          document.getElementById(resource + 'CountUpAnim').style.backgroundImage="linear-gradient(to right, "+conditions[resource].gradientColors[0]+", "+conditions[resource].gradientColors[0]+" "+gradientPercent+"%, "+conditions[resource].gradientColors[1]+" 1%)";
          conditions[resource][resource + 'CountUpAnim'].options.ratePerSecond = conditions[resource].ratePerSecond;
        }
      } 
      conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / conditions[resource].ratePerSecond;
      //reset previous animation, because it will continue to run in the background otherwise
      
    //Case 2: called without event, which means it was from init()
    //FIXME: will this need to be fixed if more than just heat present?  ie user loads a game
    } else {
      resource = "heat";
      countUpName = resource + 'CountUpAnim';
    }
    
    //please do not animate the counter if it's paused!
    if (conditions[resource].paused === false){
      try{
      conditions[resource][countUpName].reset();
      } catch (e) {}
      theMachine.animateCountUp(countUpName, elemnt, resource);
    }
    theMachine.manualCounterButtonStatus(resource);
  }
}

theMachine.init();