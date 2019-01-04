/**
*TODO: 
*2) add containers (requirement to increase capacity)
*  2a) reduce heatRatePerSecond by containerPerSecondHeatCost
*    2a1) somehow balance both counters
*      2a1a) if (containerPerSecondHeatCost > 0) {
*               heatRatePerSecond -= containerPerSecondHeatCost
*               }
*               numAnim = new Countup //etc, etc
*3) what to store in  local storage??
*  3a) I want to be able to continue the game each time browser is opened
*    3a1) save data on close?  Save any other times or irrelevant? 
*      3a1a) Save data on close completed.  Is this best practice?
*    3c) each button / attribute should have a level associated with it.
*        ratePerSecond = {rate: 1, level: 1)
*4) build out logic of which elements belong in resources GlobalData.resourceUnlocked
*  4a) incoroprate this logic into the research page
*  4b) create breakpoints where new research is also unlocked
*5) write out code for failing tests in test.html
**/

/**FIXME:
*1) excessive button clicks call animateCountUp and prevent resource counter / CountUp progress
*  1a) limit clicks to every half second?
*2) countUp.js printValue() has duplicate code to theMachine.js renderWhilePaused() 
*   for class='collapsible' child elements DOM manipulation.  
*   There should be a single source of truth.
*  2a) it is duplicated because countUp.js handles DOM during animations and
*      renderWhilePaused() handles DOM during paused or no workers assigned
*  2b) However, class='collapsible' child elements do not need to be animated => this code
*      should be removed from countUp.js and called somewhere in theMachine.js or perhaps
*      collapse.js???  Since this is inside the collapse item, but it's also part of theMachine...
**/

let conditions;

let globalData;


let theMachine = {
  
   animateCountUp(resource, countUpName, elemnt) {
     
    //make sure duration has been updated
    conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / (conditions[resource].ratePerSecond * conditions[resource].workersAssigned);
    
    //Case 1: animation is not paused && there are more than 0 workers assigned, please render it
    if (conditions[resource].paused === false && conditions[resource].duration !== Infinity){
      try{
      conditions[resource][countUpName].reset();
      } catch (e) {}
      //call a new animation with updated values for automated resources
      conditions[resource][countUpName] = new CountUp(elemnt, conditions[resource].startValue, conditions[resource].endValue, 0, conditions[resource].duration, {useEasing:false, suffix: ' / '+ conditions[resource].endValue.toLocaleString(), gradientColors: conditions[resource].gradientColors, ratePerSecond: conditions[resource].ratePerSecond * conditions[resource].workersAssigned});
      if (!conditions[resource][countUpName].error) {
          window.onload = conditions[resource][countUpName].start();
      } else {
          console.error(conditions[resource][countUpName].error);
      }
    //Case 2: There are no workers assigned || The countUp is paused
    } else {
        theMachine.renderWhilePaused(resource, countUpName);
      }
  },
  
  automationButton(event) {
    
    let resource = event.target.dataset.resource; //heat or tanks or fuel, etc
    let countUpNameAuto = resource + 'CountUpAnim';
    //case 1: stopping automation
    if (document.getElementById(resource + 'AutomationButton').innerHTML === "Enable Automation" || conditions[resource].paused === true){
      document.getElementById(resource + 'AutomationButton').innerHTML = "Disable Automation";
      document.getElementById(resource + 'Plus').style.display = 'inline-block';
      document.getElementById(resource + 'Plus').style.marginLeft = "5%";
      document.getElementById(resource + 'Minus').style.display = 'inline-block';
      document.getElementById(resource + 'Rate').style.visibility = 'visible';
      document.getElementById(resource + 'Time').style.visibility = 'visible';
      document.getElementById(resource + 'WorkerCount').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.display = 'none';
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'none'; 
      //check if any resources have been generated manually and start the (updated) counter again
      conditions[resource].paused = false;
      theMachine.pauseResume(resource, countUpNameAuto);
    //case 2: starting automation
    } else {
      conditions[resource].paused = true;
      theMachine.renderWhilePaused(resource, countUpNameAuto);
      theMachine.pauseResume(resource, countUpNameAuto);
      theMachine.manualCounterButtonStatus(resource, countUpNameAuto);
    }
  },
  
  bindEvents() {
    /** this event listener creates a local storage item every time the page is left
    *   while this is good in theory for production, it's bad for testing.
    *  Currently disabled.
    **/
    
    window.addEventListener('beforeunload', function(event) {
      theMachine.calculateValues('bindEvents');
      theMachine.store('theMachine', conditions);
      theMachine.store('globalData', globalData);
    });  
    
  },
  
  calculateValues(whichCalculation) {
    //add calculated values (cannot be assigned during object creation, it causes an error)
    if (whichCalculation === 'init'){
      globalData.unlockedResources.forEach(function(resource){
        conditions[resource]['counterElement'] = document.getElementById(resource + 'CountUpAnim');
        conditions[resource]['counterElementManual'] = document.getElementById(resource + 'CountUpAnimManual');
        //checks if page was left while not paused => we should calculate how much progress was made
        if (conditions[resource]['wasPageLeft'] && conditions[resource].paused === false) {
          //amount of progress made after page was left
          let newStartValue = (Date.now() - conditions[resource].wasPageLeft)*conditions[resource].ratePerSecond/1000;
          //check if amount of progress exceeds cap
          if (newStartValue > conditions[resource].endValue) {
            //Case 1: yes it does => startValue = endValue;
            conditions[resource].startValue = conditions[resource].endValue; 
          } else {
            //case 2: no it doesn't => startValue = newStartValue
            conditions[resource].startValue += newStartValue;
          }
        }
        conditions[resource]['wasPageLeft'] = false;
      });
    }
    if (whichCalculation === 'bindEvents'){
      globalData.unlockedResources.forEach(function(resource){
        theMachine.checkStartValue(resource, resource + 'CountUpAnim');
        //save the timestamp when page was left to calculate progress upon reloading.
        conditions[resource].wasPageLeft = Date.now();
      });
    }
  },
  
  checkStartValue(resource, countUpNameAuto) {
    try {
      //case 1: the counter is not yet completed and we can access it's values
      if (conditions[resource][countUpNameAuto].frameVal > conditions[resource].startValue) {
          conditions[resource].startValue = conditions[resource][countUpNameAuto].frameVal;
          conditions[resource][countUpNameAuto].startVal = conditions[resource][countUpNameAuto].frameVal;
        }
      //case 2: the counter is completed or deleted (test cases only), we cannot access it's values
    } catch (e) {
      let checkInnerHTML = parseInt(document.getElementById(countUpNameAuto).innerHTML.split('/')[0].trim());
      //confirm checkInnerHTML is a number, not NaN
      if (checkInnerHTML === 'number') {
        //confirm checkInnerHTML > startValue
        if (checkInnerHTML > conditions[resource].startValue) {
          conditions[resource].startValue = parseInt(checkInnerHTML); 
        }
      }
    }
    
  },
  
  init() {
    //disabled for testing purposes
    //theMachine.bindEvents();
    
    //check if any data is stored from a previous session
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');
      globalData = theMachine.store('globalData');
    } else {
      conditions = (
        {
          heat: { counterElement: "", counterElementManual: "", duration: "", efficiency: 25.12, endValue: 10, gradientColors: ["white", "#F5F5F5"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 10 },
          tanks: { counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["orange", "#F5F5F5"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          klins: { counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["white", "orange"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 0 },
          liquid: { counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["white", "orange"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 0 }
        }); 
      (
      globalData = {
       globalWorkerCap: 5, globalWorkersAvailable: 5, unlockedResources: ['heat', 'tanks']  
      });
    }
    globalData.unlockedResources.forEach(function(resource){
      templates.createResourceBarHTML(resource);
    });
    
    theMachine.calculateValues('init');
    //start counters for all resources available
    globalData.unlockedResources.forEach(function(resource){
      theMachine.renderWorkers(resource);
      let countUpNameAuto = resource + 'CountUpAnim';
      theMachine.animateCountUp(resource, countUpNameAuto, conditions[resource].counterElement);
    });
    
  },
  manualCounterButton(event) {
    /**TODO:
    * 1) build out heatManual button
    *      1a2a) increase +1 amount based on capacity?? Should level with capacity??
    *            With 10 capacity +1 is a lot.  With 10,000 cap, +1 is nothing. Needs to scale.
    */
    let resource = event.target.dataset.resource;
    let countUpName = resource + 'CountUpAnimManual'; 
    let countUpNameAuto = resource + 'CountUpAnim'; 
    let targetElement = document.getElementById(countUpName);
    let startValue = 0;
    let endValue = 100;
    let decimals = 0;
    let duration = 4;
    
    /**When pausing the counter, startValue is not automatically updated.
    *  This could cause a discrepancy when the counter is restarted.
    *  Thus we will match startValue to frameVal before doing +1 to startValue
    **/
    theMachine.checkStartValue(resource, countUpNameAuto);
    conditions[resource][countUpName] = new CountUp(targetElement, startValue, endValue, decimals, duration, {useEasing:false, suffix: ' / '+ '1', gradientColors: conditions[resource].gradientColors});
    if (!conditions[resource][countUpName].error) {
        window.onload = conditions[resource][countUpName].start();
    } else {
        console.error(conditions[resource][countUpName].error);
    }
    //disable button until manual resource generation is finished
    document.getElementById(event.target.id).disabled = true;
    //wait for the manual resource generation to finish & update accordingly
    setTimeout(function() {
      conditions[resource].startValue += 1;
      theMachine.updateGradientAndValue(resource, countUpNameAuto);    
      if (!(conditions[resource].startValue === conditions[resource].endVal)) {
        document.getElementById(event.target.id).disabled = false;
      }
      }, duration*1000);
    
    
  },
  
  manualCounterButtonStatus(resource, countUpNameAuto) {
    //User cannot add more resource than maximum (endValue) so disable the manual button.
    theMachine.checkStartValue(resource, countUpNameAuto);
    if (conditions[resource].startValue === conditions[resource].endValue){
      document.getElementById(resource + 'Manual').disabled = true;
    } else {
      document.getElementById(resource + 'Manual').disabled = false;
    }
  },
    
  pauseResume(resource, countUpNameAuto) {
    //This function will pauseResume the desired countUpNameAuto, as stored on the conditions object.
    let elemnt = document.getElementById(countUpNameAuto);
    theMachine.checkStartValue(resource, countUpNameAuto);   
    if (conditions[resource].paused === false){
      theMachine.animateCountUp(resource, countUpNameAuto, elemnt);
    } else {
      //if a CountUp was never started, it cannot be paused and will throw an error
      try {
      conditions[resource][countUpNameAuto].pauseResume();
      } catch(e) {}
    }
  },
  
  renderWhilePaused(resource, countUpNameAuto) {
    //Case 1: duration is divided by 0 => there's no workers for this resource.
    if (conditions[resource].duration === Infinity){
      try {
        conditions[resource][countUpNameAuto].reset();
      } catch (e) {}
      conditions[resource].counterElement.innerHTML = conditions[resource].startValue + ' / ' + conditions[resource].endValue;
      document.getElementById(resource + 'Rate').innerHTML = '<b>Rate:</b> 0.00';
      document.getElementById(resource + 'Time').innerHTML = '<b>Time Remaining:</b> unknown';
    }
    //Case 2: CountUp Animation is paused => manual resource button related DOM manipulation
    if (conditions[resource].paused === true) {
      document.getElementById(resource + 'AutomationButton').innerHTML = "Enable Automation";
      document.getElementById(resource + 'Plus').style.display = 'none';
      document.getElementById(resource + 'Minus').style.display = 'none';
      document.getElementById(resource + 'Rate').style.visibility = 'hidden';
      document.getElementById(resource + 'Time').style.visibility = 'hidden';
      document.getElementById(resource + 'WorkerCount').style.visibility = 'hidden';
      document.getElementById(resource + 'Manual').style.display = 'inline';
      document.getElementById(resource + 'Manual').style.visibility = 'visible';
      document.getElementById(resource + 'Manual').style.width = '48px';
      document.getElementById(resource + 'Manual').style.marginLeft = "5%";
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'block';
      
      theMachine.manualCounterButtonStatus(resource, countUpNameAuto);
    }
    
    //collapse child elements related DOM manipulation
    document.getElementById(resource + 'ItemCap').innerHTML = 'Item Cap: <b>' + conditions[resource].endValue.toLocaleString() + '</b>';
    document.getElementById(resource + 'JobCost').innerHTML = '<b>Cost: </b>' + parseFloat(conditions[resource].rateCost.toFixed(3)).toLocaleString() + ' Heat';
    document.getElementById(resource + 'NextRate').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].rateCost + conditions[resource].rateCost * 0.1).toFixed(3)).toLocaleString() + ' Heat';
    document.getElementById(resource + 'JobLevel').innerHTML = '<b>Level: </b>' + conditions[resource].rateLevel + ' Heat';
    document.getElementById(resource + 'WorkerCap').innerHTML = 'Worker Cap: <b>' + conditions[resource].workerCap + '</b>';
    document.getElementById(resource + 'AutomationRate').innerHTML = 'Automation Rate: <b>' + parseFloat(conditions[resource].ratePerSecond.toFixed(3)).toLocaleString() + '/s</b>';
    document.getElementById(resource + 'WorkerEfficiency').innerHTML = 'Worker Efficiency: <b>' + conditions[resource].efficiency + '%</b>';
    
    theMachine.checkStartValue(resource, countUpNameAuto);
    theMachine.updateGradientAndValue(resource, countUpNameAuto);
    
  },
  
  renderWorkers(resource) {
    //update DOM
    try {
      document.getElementById(resource + 'WorkerCount').innerHTML = conditions[resource].workersAssigned + '/' + conditions[resource].workerCap;
      document.getElementById('globalWorkerCount').innerHTML = 'Workers: ' + globalData.globalWorkersAvailable + '/' + globalData.globalWorkerCap;
    } catch (e) {}
  
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
  
  updateCounterButtons(event) {
    /**
    * Depending which element is clicked in the DOM this function will dynamically: 
    * 1) Increase the capacity by +10 or 
    * 2) Increase rate/second by 1 each time it is called or
    * 3) It then restarts the animation, calling theMachine.animateCountUp
    *
    **/    
    let resource = event.target.dataset.resource; //heat or tanks or fuel, etc;
    let countUpNameAuto = resource + 'CountUpAnim';
    let elemnt = conditions[resource].counterElement;;

    theMachine.checkStartValue(resource, countUpNameAuto);

    if (event.target.innerHTML === 'Item Capacity') {
      conditions[resource].endValue += 10;
    } 
    //check if enough heat to upgrade speed
    if (event.target.innerHTML === 'Job Speed') {
      //Job Speed cost is heat specific, 'heat' related code should be hard coded here
      theMachine.checkStartValue('heat', 'heatCountUpAnim');
      if (conditions.heat.startValue >= conditions[resource].rateCost) {
        //increase 10%
        conditions[resource].ratePerSecond += (conditions[resource].ratePerSecond * 0.1);
        conditions[resource].ratePerSecond = parseFloat(conditions[resource].ratePerSecond.toFixed(4));
        conditions.heat.startValue -= conditions[resource].rateCost;
        //prevent theMachine.checkStartValue from overwriting startValue while paused
        try{
          conditions.heat.heatCountUpAnim.frameVal = conditions.heat.startValue;
        }catch(e){}
        conditions[resource].rateCost += (conditions[resource].rateCost * 0.1);
        conditions[resource].rateLevel += 1;
        if (resource !== 'heat') {
          theMachine.animateCountUp('heat', 'heatCountUpAnim', conditions.heat.counterElement);
        }
      }
    }

    theMachine.animateCountUp(resource, countUpNameAuto, elemnt);
    
  },
  
  updateGradientAndValue(resource, countUpNameAuto) {
    let gradientPercent = conditions[resource].startValue / conditions[resource].endValue * 100;
    document.getElementById(countUpNameAuto).innerHTML = conditions[resource].startValue + ' / ' + conditions[resource].endValue;
    document.getElementById(countUpNameAuto).style.backgroundImage="linear-gradient(to right, "+conditions[resource].gradientColors[0]+", "+conditions[resource].gradientColors[0]+" "+gradientPercent+"%, "+conditions[resource].gradientColors[1]+" 1%)";
  },
  
  workerButtons(event) {
    let resource = event.target.dataset.resource;
    let countUpName =  resource + 'CountUpAnim';
    //check if adding workers
    if (event.target.innerHTML === '+') {
      //check if there's any workers left in global pool
      if (globalData.globalWorkersAvailable > 0) {
        //check if resource cap is not exceeded
        if (conditions[resource].workersAssigned < conditions[resource].workerCap) {
          conditions[resource].workersAssigned += 1;
          globalData.globalWorkersAvailable -= 1;
        }
      }
    }
    
    //check if subtrating workers
    if (event.target.innerHTML === '-') {
      //check if there's any workers left in resource pool
      if (conditions[resource].workersAssigned > 0) {
        conditions[resource].workersAssigned -= 1;
        globalData.globalWorkersAvailable += 1;        
      }
    }
    theMachine.checkStartValue(resource, countUpName); 
    theMachine.renderWorkers(resource);
    theMachine.animateCountUp(resource, countUpName, conditions[resource].counterElement);
    
  }
  
};

window.onload = function() {
  //on start our counters on the machine page
  //TODO: expand this logic when adding additional pages that require counters
  if (location.href.split('/').slice(-1)[0].toLowerCase() === '') {
    theMachine.init(); 
  }
};
