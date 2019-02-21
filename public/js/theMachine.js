/**
*TODO: 
*3) what to store in  local storage??
*  3a) I want to be able to continue the game each time browser is opened
*    3a1) save data on close?  Save any other times or irrelevant? 
*      3a1a) Save data on close completed.  Is this best practice?

*5) research.html css file and/or align class names to theMachine.css  
*6) create header link to theArmory, Soldiers, Inventor, Hunter, etc
*  6a) unlocked header based on research
*7) theMachine.updateCounterButtons() add logic for additional resource costs
*  7b) crafting workers capacity costs klins
*  7c) crafting efficiency costs fluid
*8) theMachine.updateCounterbuttons() add logic for additional pages
*  8a) theArmory, Soldiers, Inventor, Hunter, etc
*9) theMachine.researchButtons() should check for any progress made since leaving the craft page
    to check if requirements are still met
*10) add efficiency updateCounterButtons() tests
*11) add klins updateCounterButton() tests
*12) rate does not show as 0 when no workers assigned
**/

/**FIXME:
*2) countUp.js printValue() has duplicate code to theMachine.js renderWhilePaused() 
*   for class='collapsible' child elements DOM manipulation.  
*   There should be a single source of truth.
*  2a) it is duplicated because countUp.js handles DOM during animations and
*      renderWhilePaused() handles DOM during paused or no workers assigned
*  2b) However, class='collapsible' child elements do not need to be animated => this code
*      should be removed from countUp.js and called somewhere in theMachine.js or perhaps
*      collapse.js???  Since this is inside the collapse item, but it's also part of theMachine...
*3) theMachine.updateCounterButton() should work for other page besides craft (theArmory, Soldier, etc) - make it DRY
**/




/**TODO: test.html
*1) look up promises
*  1a) test settimout.then tests()? to call tinytest?
**/

let conditions;

let globalData;


let theMachine = {

  animateCountUp(resource, countUpName, elemnt, resourceSpent) {
    //it will not try to animate an element that does not exist
    if (elemnt === null || elemnt.innerHTML === undefined) {
      return
    }
    let startValue = conditions[resource].startValue;
    let resourceRequired = conditions[resource].resourceRequired;
    let endValue;
    let ratePerSecond;
    
    theMachine.cancelAnimation(resource);
    
    if (conditions[resource].ratePerSecondBase) {
      //make sure duration has been updated (if ratePerSecondBase => ratePerSecond already has # of workers factored in)
      conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / (conditions[resource].ratePerSecond);  
      ratePerSecond = conditions[resource].ratePerSecond;
    } else {
      //make sure duration has been updated
      conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / (conditions[resource].ratePerSecond * conditions[resource].workersAssigned);
      ratePerSecond = conditions[resource].ratePerSecond * conditions[resource].workersAssigned;
    }
    
    if (conditions[resource].ratePerSecond < 0) {
      //countDown if ratePerSecond is negative
      endValue = 0;
      //recalculate duration from startValue down to zero
      conditions[resource].duration = (-conditions[resource].startValue) / (conditions[resource].ratePerSecond);
      if (conditions.heat.timeOutId) {
        try {
          window.clearTimeout(conditions.heat.timeOutId);
        } catch (e) {}
      }
      //after heat runs out, cancel other timers that depend on heat
      conditions.heat.timeOutId =  window.setTimeout(function() {
        globalData.craftUnlockedResources.forEach(function(resource) {
          theMachine.cancelAnimation(resource);
        });
        conditions.heat.startValue = 0;
        delete conditions.heat.heatCountUpAnim;
      }, conditions[resource].duration * 1000);
    } else {
      //else countUp
      endValue = conditions[resource].endValue;
    }
    //conditions to check before animation
    if (theMachine.progressionCheck(resource)) {
        //call a new animation with updated values for automated resources
        conditions[resource][countUpName] = new CountUp(elemnt, startValue, endValue, 0, conditions[resource].duration, {useEasing:false, suffix: ' / '+ conditions[resource].endValue.toLocaleString(), gradientColors: conditions[resource].gradientColors, ratePerSecond: ratePerSecond});
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
    let resourceRequired = conditions[resource].resourceRequired;
    //case 1: starting automation
    if (document.getElementById(resource + 'AutomationButton').innerHTML === "Enable Automation" || conditions[resource].paused === true){
      document.getElementById(resource + 'AutomationButton').innerHTML = "Disable Automation";
      document.getElementById(resource + 'Plus').style.display = 'inline-block';
      document.getElementById(resource + 'Plus').style.marginLeft = "5%";
      document.getElementById(resource + 'Minus').style.display = 'inline-block';
      document.getElementById(resource + 'Rate').style.visibility = 'visible';
      document.getElementById(resource + 'Time').style.visibility = 'visible';
      document.getElementById(resource + 'WorkerCount').style.display = 'inline-block';
      document.getElementById(resource + 'Manual').style.display = 'none';
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'none'; 
      //check if any resources have been generated manually and start the (updated) counter again
      conditions[resource].paused = false;
      theMachine.pauseResume(resource, countUpNameAuto);
      if (resource !== resourceRequired) {
        //increase resourceRequired ratePerSecond by amount previously drained by resource
        conditions[resourceRequired].ratePerSecond -= (conditions[resource].ratePerSecond / 3) * conditions[resource].workersAssigned;
      }
    //case 2: stopping automation
    } else {
      conditions[resource].paused = true;
      theMachine.renderWhilePaused(resource, countUpNameAuto);
      theMachine.pauseResume(resource, countUpNameAuto);
      theMachine.manualCounterButtonStatus(resource, countUpNameAuto);
      if (resource !== resourceRequired) {
        //increase resourceRequired ratePerSecond by amount previously drained by resource
        conditions[resourceRequired].ratePerSecond += (conditions[resource].ratePerSecond / 3) * conditions[resource].workersAssigned;
      }
    }
    //restart resourceRequired with new ratePerSecond information
    if (resource !== resourceRequired) {
      theMachine.checkStartValue(resourceRequired, resourceRequired + 'CountUpAnim');
      theMachine.animateCountUp(resourceRequired, resourceRequired + 'CountUpAnim', conditions[resourceRequired].counterElement);
    }
  },
  
  bindEvents(whichInit) {
    /** this event listener creates a local storage item every time the page is left
    *   while this is good in theory for production, it's bad for testing.
    *  Currently disabled.
    **/
    
    window.addEventListener('beforeunload', function(event) {
      try {
        theMachine.calculateValues('bindEvents', whichInit);
      } catch (e) {}
      theMachine.store('theMachine', conditions);
      theMachine.store('globalData', globalData);
    });  
    
  },
  
  calculateResourceGenerationOverTime(resource) {
    //calculates the amount of progress made after page was left
    if (conditions[resource].ratePerSecondBase || conditions[resource].ratePerSecond < 0) {
      //if (ratePerSecondBase) => # of workers already factored in by +/- buttons (theMachine.workerButtons())
      return theMachine.formatNumber(((Date.now() - conditions[resource].wasPageLeft) * conditions[resource].ratePerSecond/1000), 2);
    } else {
      //everything else needs to consider the number of workersAssigned
      return theMachine.formatNumber(((Date.now() - conditions[resource].wasPageLeft) * (conditions[resource].ratePerSecond/1000) * conditions[resource].workersAssigned), 2);
    }
  },
  
  calculateValues(whichCalculation, whichInit) {
    /*usage:
    *1) whichCalculation = 'init' or 'bindEvents'
    *2) whichInit = 'craftUnlockedResources' or 'theArmoryUnlockedResources' or etc
    */
    if (whichCalculation === 'bindEvents'){
      globalData[whichInit].forEach(function(resource){
        theMachine.checkStartValue(resource, resource + 'CountUpAnim');
        //save the timestamp when page was left to calculate progress upon reloading.
        conditions[resource].wasPageLeft = Date.now();
      });
    }
    
    //add calculated values (cannot be assigned during object creation, it causes an error)
    if (whichCalculation === 'init'){
      globalData[whichInit].forEach(function(resource){
        conditions[resource]['counterElement'] = document.getElementById(resource + 'CountUpAnim');
        conditions[resource]['counterElementManual'] = document.getElementById(resource + 'CountUpAnimManual');
        //checks if page was left while not paused and workers assigned > 0 => we should calculate how much progress was made
        if (conditions[resource]['wasPageLeft'] && theMachine.progressionCheck(resource)) {
          //amount of progress made after page was left
          let generation = theMachine.calculateResourceGenerationOverTime(resource);
          let newStartValue = conditions[resource].startValue + generation;
          //check if amount of progress exceeds cap
          if (newStartValue > conditions[resource].endValue) {
            //Case 1: Case 1: Resource generation cannot exceed endValue;
            conditions[resource].startValue = conditions[resource].endValue; 
          } else if (newStartValue < 0) {
            //Case 2: Negative resource generation cannot cause startValue to be less than 0;
            conditions[resource].startValue = 0;
          } else {
            //Case 3: it is safe to set startValue = newStartValue
            conditions[resource].startValue = newStartValue;
          }
            
        }
        conditions[resource]['wasPageLeft'] = false;
      });
    }
  },
  
  cancelAnimation(resource) {
    //prevent duplicate countUps by stopping anything that may have been previously running
    try {
      delete conditions[resource][resource + 'CountUpAnim'].count;
      delete conditions[resource][resource + 'CountUpAnim'].duration;
    } catch (e) {}
  },
  
  checkStartValue(resource, countUpNameAuto) {
    
    //case 1: resource is not present on the screen.  i.e. theArmory page does not have heat, tanks, klins or fluid present
    if (document.getElementById(resource) === null) {
      //update resource startValue
      let generation = theMachine.calculateResourceGenerationOverTime(resource);
      conditions[resource].startValue += generation;
      //reset wasPageLeft for future calculations
      conditions[resource].wasPageLeft = Date.now();
    } else {
      try {
        //case 2: if (frameVal > startValue && rate > 0) || (frameVal < startValue && rate <0)it will set startValue = frameVal
        if ((conditions[resource][countUpNameAuto].frameVal > conditions[resource].startValue && conditions[resource].ratePerSecond >= 0) || (conditions[resource][countUpNameAuto].frameVal < conditions[resource].startValue && conditions[resource].ratePerSecond < 0)) {
            conditions[resource].startValue = conditions[resource][countUpNameAuto].frameVal;
            conditions[resource][countUpNameAuto].startVal = conditions[resource][countUpNameAuto].frameVal;
          }
        //case 3: it will update startValue when the counter is completed or deleted (by reading HTML values)
      } catch (e) {
        let checkInnerHTML = parseInt(document.getElementById(countUpNameAuto).innerHTML.split('/')[0].trim());
        //confirm checkInnerHTML is a number, not NaN
        if (typeof(checkInnerHTML) === 'number') {
          //confirm checkInnerHTML > startValue
          if (checkInnerHTML > conditions[resource].startValue) {
            conditions[resource].startValue = parseInt(checkInnerHTML); 
          }
        }
      }
    }
    
  },
  
  formatNumber(toFormat, decimalPlaces) {
    /**this function will:
    *1) round to a specified number of decimal places via .toFixed
    *2) it will then convert the resulting string into a float (number type in javascript) via parseFloat
    **/
    return parseFloat(toFormat.toFixed(decimalPlaces))
  },
  
  init(whichInit) {
    //disabled for testing purposes
    theMachine.bindEvents(whichInit);
    
    //check if any data is stored from a previous session else use defaults
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');
      globalData = theMachine.store('globalData');
    } else {
      conditions = (
        {
          heat: { capacityCost: 5, capacityLevel: 1, counterElement: "", counterElementManual: "", duration: "", efficiency: 25.12, endValue: 10, fluidCost: 7, fluidLevel: 1, gradientColors: ["white", "#F5F5F5"], klinsCost: 6, klinsLevel: 1, paused: false, ratePerSecond: 0.5, ratePerSecondBase: 0.5, rateCost: 6, rateLevel: 1, resourceRequired: 'heat', startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          tanks: { capacityCost: 5, capacityLevel: 1, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, fluidCost: 7, fluidLevel: 1, gradientColors: ["#ff6a00", "#F5F5F5"], klinsCost: 6, klinsLevel: 1, paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, resourceRequired: 'heat', startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          klins: { capacityCost: 5, capacityLevel: 1, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, fluidCost: 7, fluidLevel: 1, gradientColors: ["#96825d", "#F5F5F5"], klinsCost: 6, klinsLevel: 1, paused: true, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, resourceRequired: 'heat', startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          fluid: { capacityCost: 5, capacityLevel: 1, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, fluidCost: 7, fluidLevel: 1, gradientColors: ["#e8a01b", "#F5F5F5"], klinsCost: 6, klinsLevel: 1, paused: true, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, resourceRequired: 'heat', startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          workers: {capacityCost: 5, capacityLevel: 1, counterElement: "", counterElementManual: "", duration: "", endValue: 5, gradientColors: ["#e8a01b", "#F5F5F5"], paused: true, rateCost: 6, rateLevel: 1, ratePerSecond: 0.5, resourceRequired: 'heat', startValue: 5, wasPageLeft: false}
        }); 
      globalData = (
      {
        globalWorkersAvailable: 5, globalWorkerCap: 5, globalWorkersRecruited: 5, workersUnlocked: false,
        craftUnlockedResources: ['heat'], 
        craftLockedResources: ['tanks', 'klins', 'fluid'],
        theArmoryUnlockedResources: [],
        theArmoryLockedResources: ['workers'],
      });
    }
    
    if (!(whichInit === 'theArmoryUnlockedResources' && globalData.workersUnlocked === false)) {
      globalData[whichInit].forEach(function(resource){
        templates.createResourceBarHTML(resource);
      });
    }
    
    theMachine.calculateValues('init', whichInit);
    
    //start counters for all resources available
    globalData[whichInit].forEach(function(resource){
      theMachine.renderWorkers(resource);
      let countUpNameAuto = resource + 'CountUpAnim';
      theMachine.animateCountUp(resource, countUpNameAuto, conditions[resource].counterElement);
    });
    
  },
  
  manualCounterButton(event) {

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
    
    event.target.disabled = true;
    //wait for the manual resource generation to finish & update accordingly
    setTimeout(function() {
      conditions[resource].startValue += 1;
      theMachine.updateGradientAndValue(resource, countUpNameAuto);    
      if (!(conditions[resource].startValue === conditions[resource].endVal)) {
        event.target.disabled = false;
      }
      if (resource === 'workers') {
        if (globalData.globalWorkersRecruited < globalData.globalWorkerCap) {
          globalData.globalWorkersAvailable += 1;
          globalData.globalWorkersRecruited += 1;
          theMachine.renderWorkers(resource);
        }
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
  
  progressionCheck(resource) {
    let resourceRequired = conditions[resource].resourceRequired;
    let ratePerSecond = conditions[resource].ratePerSecond;
    //conditions to check before animation
    if (resource === resourceRequired || conditions[resourceRequired].startValue > 0 || (conditions[resourceRequired].startValue === 0 && conditions[resourceRequired].ratePerSecond > 0)) {
      //Case 1: it will animate if not paused && there are more than 0 workers assigned || rate < 0
      if ((conditions[resource].paused === false && conditions[resource].workersAssigned !== 0 && ratePerSecond !== 0) || (ratePerSecond < 0)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },
    
  renderWhilePaused(resource, countUpNameAuto) {
    //breakout of function if there is no element (should only happen to workers)
    if (document.getElementById(resource) === null) {
      return 
    }
    //Case 1: there's no workers for this resource || the rate === 0
    if (conditions[resource].workersAssigned === 0 || conditions[resource].ratePerSecond === 0){
      theMachine.cancelAnimation(resource);
      conditions[resource].counterElement.innerHTML = conditions[resource].startValue + ' / ' + conditions[resource].endValue;
      document.getElementById(resource + 'Time').innerHTML = '<b>Time Remaining:</b> unknown';
      if (conditions[resource].ratePerSecond < 0) {
        document.getElementById(resource + 'Rate').innerHTML = '<b>Rate:</b> ' + conditions[resource].ratePerSecond + ' / second';
      } else {
        document.getElementById(resource + 'Rate').innerHTML = '<b>Rate:</b> 0.00 / second';
      }
    }
    
    //Case 2: CountUp Animation is paused or workers not unlocked => manual resource button related DOM manipulation
    if (conditions[resource].paused === true || globalData.workersUnlocked === false) {
      document.getElementById(resource + 'AutomationButton').innerHTML = "Enable Automation";
      document.getElementById(resource + 'Plus').style.display = 'none';
      document.getElementById(resource + 'Minus').style.display = 'none';
      document.getElementById(resource + 'Rate').style.visibility = 'hidden';
      document.getElementById(resource + 'Time').style.visibility = 'hidden';
      document.getElementById(resource + 'WorkerCount').style.display = 'none';
      document.getElementById(resource + 'Manual').style.display = 'inline';
      document.getElementById(resource + 'Manual').style.visibility = 'visible';
      // document.getElementById(resource + 'Manual').style.width = '48px';
      document.getElementById(resource + 'Manual').style.marginLeft = "5%";
      document.getElementById(resource + 'CountUpAnimManual').style.display = 'block';
    }

    //collapse child elements related DOM manipulation
    document.getElementById(resource + 'ItemCap').innerHTML = 'Item Cap: <b>' + conditions[resource].endValue.toLocaleString() + '</b>';
    document.getElementById(resource + 'JobCost').innerHTML = '<b>Cost: </b>' + theMachine.formatNumber(conditions[resource].rateCost).toLocaleString() + ' Heat';
    document.getElementById(resource + 'NextRate').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].rateCost + conditions[resource].rateCost * 0.1).toFixed(3)).toLocaleString() + ' Heat';
    document.getElementById(resource + 'JobLevel').innerHTML = '<b>Level: </b>' + conditions[resource].rateLevel;
    document.getElementById(resource + 'WorkerCap').innerHTML = 'Worker Cap: <b>' + conditions[resource].workerCap + '</b>';
    document.getElementById(resource + 'AutomationRate').innerHTML = 'Automation Rate: <b>' + parseFloat(conditions[resource].ratePerSecond.toFixed(3)).toLocaleString() + '/s</b>';
    document.getElementById(resource + 'WorkerEfficiency').innerHTML = 'Worker Efficiency: <b>' + conditions[resource].efficiency + '%</b>';
    document.getElementById(resource + 'ItemCost').innerHTML = '<b>Cost: </b>' + conditions[resource].capacityCost + ' Tanks';
    document.getElementById(resource + 'ItemLevel').innerHTML = '<b>Level: </b>' + conditions[resource].capacityLevel;
    document.getElementById(resource + 'NextItem').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].capacityCost + conditions[resource].capacityCost * 0.1).toFixed(3)).toLocaleString() + ' Tanks';
    document.getElementById(resource + 'FluidCost').innerHTML = '<b>Cost: </b>' + conditions[resource].fluidCost + ' Fluid';
    document.getElementById(resource + 'FluidLevel').innerHTML = '<b>Level: </b>' + conditions[resource].fluidLevel;
    document.getElementById(resource + 'NextFluid').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].fluidCost + conditions[resource].fluidCost * 0.1).toFixed(3)).toLocaleString() + ' Fluid';
    document.getElementById(resource + 'KlinsCost').innerHTML = '<b>Cost: </b>' + conditions[resource].KlinsCost + ' Klins';
    document.getElementById(resource + 'KlinsLevel').innerHTML = '<b>Level: </b>' + conditions[resource].klinsLevel;
    document.getElementById(resource + 'NextKlins').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].klinsCost + conditions[resource].klinsCost * 0.1).toFixed(3)).toLocaleString() + ' Klins';
    document.getElementById(resource + 'WorkerCount').innerHTML = conditions[resource].workersAssigned + '/' + conditions[resource].workerCap;
    
    //if called by renderWorkers countUpNameAuto is not supplied, this if statement prevents errors
    if (countUpNameAuto) {
      theMachine.checkStartValue(resource, countUpNameAuto);
      theMachine.updateGradientAndValue(resource, countUpNameAuto);
      theMachine.manualCounterButtonStatus(resource, countUpNameAuto);
    }
    
  },
  
  renderWorkers(resource) {
    //Case 1: workers are unlocked && counter is not paused
    if (globalData.workersUnlocked === true && conditions[resource].paused === false) {
      //update DOM
      try {
        document.getElementById(resource + 'AutomationButton').style.display = 'inline-block';
        document.getElementById(resource + 'Collapsible').style.display = 'inline-block';
        document.getElementById('globalWorkerCount').style.display = 'block'
        document.getElementById(resource + 'WorkerCount').innerHTML = conditions[resource].workersAssigned + '/' + conditions[resource].workerCap;
        document.getElementById('globalWorkerCount').innerHTML = 'Workers: ' + globalData.globalWorkersAvailable + '/' + globalData.globalWorkerCap;
      } catch (e) {}
    } 
    //Case 2: workers are unlocked && counter is paused
    if (globalData.workersUnlocked === true && conditions[resource].paused === true) {
      document.getElementById('globalWorkerCount').innerHTML = 'Workers: ' + globalData.globalWorkersAvailable + '/' + globalData.globalWorkerCap;
      theMachine.renderWhilePaused(resource); 
    }
    
    //Case 3: workers are locked
    try {
      if (globalData.workersUnlocked === false) {
        document.getElementById(resource + 'AutomationButton').style.display = 'none';
        document.getElementById(resource + 'Collapsible').style.display = 'none';
        document.getElementById('globalWorkerCount').style.display = 'none';
      }
    } catch (e) {}
  
  },
  
  researchInit(){
    //gather current conditions from local storage on page load
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');
      globalData = theMachine.store('globalData');
    }
    //store current conditions before leaving the page
    theMachine.bindEvents();
    
    //update DOM
    theMachine.researchRender();
  },
  
  researchButtons(event){
    //FIXME: workers is part of global data, not a resource.
    //this creates bugs when workers is clicked
    let type = event.target.dataset.type;
    let resource = event.target.dataset.resource;
    if (!globalData[type].includes(resource)){
     globalData[type].push(resource);
    }
    
    if (resource === 'workers') {
      globalData.workersUnlocked = true; 
    }
    
  },
  
  researchRender(){
    //this function will update the DOM based on the research requirements
    
    globalData.craftLockedResources.forEach(function(arrayItem) {
      let elemnt = document.getElementById(arrayItem + 'Research');
      if (conditions.heat.startValue >= elemnt.dataset.requirement) {
        elemnt.style.display = "inline-block";
      } else {
        elemnt.style.display = "none"; 
      }
    });
    
    globalData.theArmoryLockedResources.forEach(function(arrayItem) {
      let elemnt = document.getElementById(arrayItem + 'Research');
      if (conditions.heat.startValue >= elemnt.dataset.requirement) {
        elemnt.style.display = "inline-block";
      } else {
        elemnt.style.display = "none"; 
      }
    });
    
  },
  
  store(namespace, data) {
    //this function stores data to the local storage
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      let store = localStorage.getItem(namespace);
      try {
      return (store && JSON.parse(store)) || [];
      } catch (e) {return []};
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
    let elemnt = conditions[resource].counterElement;
    let resourceRequired = conditions[resource].resourceRequired;
    let resourceSpent;
    let resourceCost;
    let valueChanged;
    let level;
    
    theMachine.checkStartValue(resource, countUpNameAuto);
    
    //set unique conditions depending on button pushed
    if (event.target.innerHTML === 'Item Capacity') {
      resourceSpent = 'tanks';
      resourceCost = 'capacityCost';
      valueChanged = 'endValue';
      level = 'capacityLevel';
    }
    
    if (event.target.innerHTML === 'Job Speed') {
      resourceSpent = 'heat';
      resourceCost = 'rateCost';
      valueChanged = 'ratePerSecond';
      if (resource === resourceSpent) {
        valueChanged = 'ratePerSecondBase';
      }
      level = 'rateLevel';
    }
    
    if (event.target.innerHTML === 'Worker Capacity') {
      resourceSpent = 'klins';
      resourceCost = 'klinsCost';
      valueChanged = 'workerCap';
      level = 'klinsLevel';
    }
    
    if (event.target.innerHTML === 'Increase Efficiency') {
      resourceSpent = 'fluid';
      resourceCost = 'fluidCost';
      valueChanged = 'efficiency';
      level = 'fluidLevel';
    }
      
    theMachine.checkStartValue(resourceSpent, resourceSpent + 'CountUpAnim');
    if (conditions[resourceSpent].startValue >= conditions[resource][resourceCost]) {
      if (resource === resourceSpent && resource === 'heat') {
        conditions[resource]['ratePerSecond'] += (conditions[resource][valueChanged] * 0.1);
      }
      conditions[resourceSpent].startValue -= conditions[resource][resourceCost];
      //workers cannot be automated, therefore it does not affect ratePerSecond
      if (resource !== 'workers') {
        //if (resource !== resourceSpent && event.target.innerHTML === 'job speed'), reduce resourceSpent.ratePerSecond by increase * workers assigned
        if (resource !== resourceSpent && event.target.innerHTML === 'Job Speed') {
          conditions[resourceSpent].ratePerSecond -= conditions[resource].ratePerSecond * 0.1 * conditions[resource].workersAssigned / 3;
        }
      }
      //Worker Capacity increases workerCap by 1, not 10%
      if (resourceSpent === 'klins') {
        conditions[resource][valueChanged] += 1;
      } else {
        //everything but klins increases by 10%
        conditions[resource][valueChanged] += (conditions[resource][valueChanged] * 0.1);
        //resource === workers also increases globalData.workerCap by +=1 instead
        if (resource === 'workers') {
          globalData.globalWorkerCap += 1;
          theMachine.renderWorkers(resource);
          conditions.workers.startValue = globalData.globalWorkersRecruited;
        }
      }
      //updating capacity => endValue can only be a whole number
      if (event.target.innerHTML === 'Item Capacity') {
        conditions[resource][valueChanged] = parseInt(conditions[resource][valueChanged].toFixed());
      }
      conditions[resource][resourceCost] += (conditions[resource][resourceCost] * 0.1);
      conditions[resource][resourceCost] = parseFloat(conditions[resource][resourceCost].toFixed(5));
      conditions[resource][level] += 1;
    }
  
    try {
      //prevent theMachine.checkStartValue from overwriting startValue while paused
        conditions[resourceSpent][resourceSpent + 'CountUpAnim'].frameVal = conditions[resourceSpent].startValue;
      } catch (e) {}
      
    if (resource !== resourceSpent) {
      theMachine.animateCountUp(resourceSpent, resourceSpent + 'CountUpAnim', conditions[resourceSpent].counterElement);
    }
    theMachine.animateCountUp(resource, countUpNameAuto, elemnt);    
    
  },
  
  updateGradientAndValue(resource, countUpNameAuto) {
    let gradientPercent = conditions[resource].startValue / conditions[resource].endValue * 100;
    document.getElementById(countUpNameAuto).innerHTML = conditions[resource].startValue + ' / ' + conditions[resource].endValue;
    document.getElementById(countUpNameAuto).style.backgroundImage="linear-gradient(to right, "+conditions[resource].gradientColors[0]+", "+conditions[resource].gradientColors[0]+" "+gradientPercent+"%, "+conditions[resource].gradientColors[1]+" 1%)";
  },
  
  workerButtons(event) {
    /**this function will:
    *1) add or subtract workers to both the resource and global pools
    *2) update the resoureSpent rate so it's resource generation can be reduced or increased accordingly.
    **/
    let resource = event.target.dataset.resource;
    let resourceRequired = conditions[resource].resourceRequired;
    let countUpName =  resource + 'CountUpAnim';
    //check if adding workers
    if (event.target.innerHTML === '+') {
      //prevent button spam from stopping countUp progress
      if (globalData.globalWorkersAvailable === 0 || conditions[resource].workersAssigned === conditions[resource].workerCap) {
        return
      }
      //check if there's any workers left in global pool
      if (globalData.globalWorkersAvailable > 0) {
        //check if resource cap is not exceeded
        if (conditions[resource].workersAssigned < conditions[resource].workerCap) {
          conditions[resource].workersAssigned += 1;
          globalData.globalWorkersAvailable -= 1;
          //3:1 ratio of resource rate vs heat drain rate... a lot of resources need need 1:1 would be too drastic.
          if (resource !== resourceRequired) {
            conditions[resourceRequired].ratePerSecond -= (conditions[resource].ratePerSecond / 3);
          //if resource === resourceSpent increase ratePerSecond by ratePerSecondBase (adding a worker increases rate)
          } else {
            conditions[resourceRequired].ratePerSecond += (conditions[resource].ratePerSecondBase);
          }
        }
      }
    }
    
    //check if subtracting workers
    if (event.target.innerHTML === '-') {
      //prevent button spam from stopping countUp progress
      if (conditions[resource].workersAssigned === 0) {
        return
      }
      //check if there's any workers left in resource pool
      if (conditions[resource].workersAssigned > 0) {
        conditions[resource].workersAssigned -= 1;
        globalData.globalWorkersAvailable += 1;
        if (resource !== resourceRequired) {
          conditions[resourceRequired].ratePerSecond += (conditions[resource].ratePerSecond / 3);
        } else {
          conditions[resourceRequired].ratePerSecond -= (conditions[resource].ratePerSecondBase);
        }
      }
    }
    
    if (conditions[resourceRequired].ratePerSecond < 0) {
      conditions[resourceRequired].wasRateNegative = true; 
    }
    
    theMachine.renderWorkers(resource);
    
    if (conditions[resourceRequired].ratePerSecond > 0 && conditions[resourceRequired].wasRateNegative === true) {
      //restart all counters dependant on resourceSpent (including resourceSpent) once resourceSpent generation is positive
      globalData.craftUnlockedResources.forEach(function(resource) {
        theMachine.checkStartValue(resource, resource + 'CountUpAnim'); 
        theMachine.animateCountUp(resource, resource + 'CountUpAnim', conditions[resource].counterElement);
      })
      
      //toggle resourceSpent.wasRateNegative back to false
      conditions[resourceRequired].wasRateNegative = false;
    } else {
      [resource, resourceRequired].forEach(function(elemnt){
        theMachine.checkStartValue(elemnt, elemnt + 'CountUpAnim'); 
      });
      //if resource is not heat && there is enough heat to animate resource
      if (resource !== resourceRequired) {
        if (conditions[resourceRequired].startValue > 0) {
          theMachine.animateCountUp(resource, countUpName, conditions[resource].counterElement);
        }
      }
    }
    
    theMachine.animateCountUp(resourceRequired, resourceRequired + 'CountUpAnim', conditions[resourceRequired].counterElement);    
  }
  
};

window.onload = function() {
  
  //on start our counters on the machine page
  //FIXME: expand this logic when adding additional pages that require counters
  if (location.href.split('/').slice(-1)[0].toLowerCase() === '') {
    theMachine.init('craftUnlockedResources'); 
  }
  if (location.href.split('/').slice(-1)[0].toLowerCase() === 'research') {
    theMachine.researchInit(); 
  }
  if (location.href.split('/').slice(-1)[0].toLowerCase() === 'armory') {
    theMachine.init('theArmoryUnlockedResources'); 
  }
  
  templates.renderHeader();
};
