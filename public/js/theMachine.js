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
*5) research.html css file and/or align class names to theMachine.css  
*6) create header link to theArmory, Soldiers, Inventor, Hunter, etc
*  6a) unlocked header based on research
*7) theMachine.updateCounterButtons() add logic for additional resource costs
*  7a) crafting capacity costs tanks
*  7b) crafting workers capacity costs klins
*  7c) crafting efficiency costs fluid
*8) theMachine.updateCounterbuttons() add logic for additional pages
*  8a) theArmory, Soldiers, Inventor, Hunter, etc
*9) theMachine.researchButtons() should check for any progress made since leaving the craft page
    to check if requirements are still met
*10) Assuming negative resource generation. Based on amount of time passed, halt resources after 
    requirement resoure hits zero regardless of time passed.
  10a) example: tanks require heat.  Heat drops to zero after 5 seconds.  Only generation
    5 seconds worth of tanks regardless of time passed.
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
*3) theMachine.updateCounterButton() should work for other page besides craft (theArmory, Soldier, etc) - make it DRY
*  3a) combine item capacity and job speed code?  there's a lot of similarity there...
**/

/**workerButtons() FIXME:
*1) new forumla: 
*conditions[resourceSpent].ratePerSecond = ([resourceSpent].workersAssigned * [rS].baseRate) - resourceSpent.rate
*a) .baseRate is a new property on conditions.heat since a resourceSpent requires special logic
*b) ratePerSecond is the actual rate depending on which resource is spending Heat
*c) baseRate is how much heat is generated per heat worker assigned
**/

/**animatecountUp() FIXME: 
*new Case 1: it's a countDown, not countUp
*1) if duration is a negative value endValue = startVal, 0 = endVal 
*2) duration = Math.abs(duration); //absolute value
**/

/**updateCounterButtons() FIXME: 
*heat needs to increase baseRate
**/

/**TODO: create heat ratePerSecond formula.
*need to consider what rate was and how it changes
**/

let conditions;

let globalData;


let theMachine = {

  animateCountUp(resource, countUpName, elemnt) {
     
    //make sure duration has been updated
    conditions[resource].duration = (conditions[resource].endValue - conditions[resource].startValue) / (conditions[resource].ratePerSecond * conditions[resource].workersAssigned);
    
    //Case 1: it will animate if not paused && there are more than 0 workers assigned
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
    return (Date.now() - conditions[resource].wasPageLeft)*conditions[resource].ratePerSecond/1000;
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
        if (conditions[resource]['wasPageLeft'] && conditions[resource].paused === false && conditions[resource].workersAssigned > 0) {
          //amount of progress made after page was left
          let newStartValue = conditions[resource].startValue + theMachine.calculateResourceGenerationOverTime(resource);
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
  
  checkStartValue(resource, countUpNameAuto) {
    try {
      //case 1: if frameVal > startValue it will set startValue = frameVal
      if (conditions[resource][countUpNameAuto].frameVal > conditions[resource].startValue) {
          conditions[resource].startValue = conditions[resource][countUpNameAuto].frameVal;
          conditions[resource][countUpNameAuto].startVal = conditions[resource][countUpNameAuto].frameVal;
        }
      //case 2: it will update startValue when the counter is completed or deleted (by reading HTML values)
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
    
  },
  
  init(whichInit) {
    //disabled for testing purposes
    //theMachine.bindEvents(whichInit);
    
    //check if any data is stored from a previous session else use defaults
    if (theMachine.store('theMachine').length !== 0){
      conditions = theMachine.store('theMachine');
      globalData = theMachine.store('globalData');
    } else {
      conditions = (
        {
          heat: { capacityCost: 5, counterElement: "", counterElementManual: "", duration: "", efficiency: 25.12, endValue: 10, gradientColors: ["white", "#F5F5F5"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 8, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          tanks: { capacityCost: 5, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["#ff6a00", "#F5F5F5"], paused: false, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 5 },
          klins: { capacityCost: 5, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["#96825d", "#F5F5F5"], paused: true, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 1 },
          fluid: { capacityCost: 5, counterElement: "", counterElementManual: "", duration: "", efficiency: 27.52, endValue: 10, gradientColors: ["#e8a01b", "#F5F5F5"], paused: true, ratePerSecond: 0.5, rateCost: 6, rateLevel: 1, startValue: 0, wasPageLeft: false, workersAssigned: 0, workerCap: 1 }
        }); 
      globalData = (
      {
        globalWorkerCap: 5, globalWorkersAvailable: 5, workersUnlocked: true,
        craftUnlockedResources: ['heat', 'tanks'], 
        craftLockedResources: ['tanks', 'klins', 'fluid'],
        theArmoryUnlockedResources: ['workers'],
        theArmoryLockedResources: ['workers'],
      });
    }
    
    globalData[whichInit].forEach(function(resource){
      templates.createResourceBarHTML(resource);
    });
    
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
    
    //Case 2: CountUp Animation is paused or workers not unlocked => manual resource button related DOM manipulation
    if (conditions[resource].paused === true || globalData.workersUnlocked === false) {
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
    }
    
    //collapse child elements related DOM manipulation
    document.getElementById(resource + 'ItemCap').innerHTML = 'Item Cap: <b>' + conditions[resource].endValue.toLocaleString() + '</b>';
    document.getElementById(resource + 'JobCost').innerHTML = '<b>Cost: </b>' + parseFloat(conditions[resource].rateCost.toFixed(3)).toLocaleString() + ' Heat';
    document.getElementById(resource + 'NextRate').innerHTML = '<b>Next: </b>' + parseFloat((conditions[resource].rateCost + conditions[resource].rateCost * 0.1).toFixed(3)).toLocaleString() + ' Heat';
    document.getElementById(resource + 'JobLevel').innerHTML = '<b>Level: </b>' + conditions[resource].rateLevel + ' Heat';
    document.getElementById(resource + 'WorkerCap').innerHTML = 'Worker Cap: <b>' + conditions[resource].workerCap + '</b>';
    document.getElementById(resource + 'AutomationRate').innerHTML = 'Automation Rate: <b>' + parseFloat(conditions[resource].ratePerSecond.toFixed(3)).toLocaleString() + '/s</b>';
    document.getElementById(resource + 'WorkerEfficiency').innerHTML = 'Worker Efficiency: <b>' + conditions[resource].efficiency + '%</b>';
    
    //if called by renderWorkers countUpNameAuto is not supplied, this if statement prevents errors
    if (countUpNameAuto) {
      //theMachine.checkStartValue(resource, countUpNameAuto);
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
      } catch (e) {console.log(e);}
    } 
    //Case 2: workers are unlocked && counter is paused
    if (globalData.workersUnlocked === true && conditions[resource].paused === true) {
      document.getElementById('globalWorkerCount').innerHTML = 'Workers: ' + globalData.globalWorkersAvailable + '/' + globalData.globalWorkerCap;
      theMachine.renderWhilePaused(resource); 
    }
    
    //Case 3: workers are locked
    if (globalData.workersUnlocked === false) {
      document.getElementById(resource + 'AutomationButton').style.display = 'none';
      document.getElementById(resource + 'Collapsible').style.display = 'none';
      document.getElementById('globalWorkerCount').style.display = 'none';
    }
  
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
    let elemnt = conditions[resource].counterElement;;

    theMachine.checkStartValue(resource, countUpNameAuto);
    
    
    let resourceSpent;
    let resourceCost;
    let valueChanged;
    let level;
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
      level = 'rateLevel';
    }
      
    theMachine.checkStartValue(resourceSpent, resourceSpent + 'CountUpAnim');
    if (conditions[resourceSpent].startValue >= conditions[resource][resourceCost]) {
      conditions[resourceSpent].startValue -= conditions[resource][resourceCost];
      conditions[resource][valueChanged] += (conditions[resource][valueChanged] * 0.1);
      conditions[resource][resourceCost] += (conditions[resource][resourceCost] * 0.1);
      conditions[resource][level] += 1;
    }
  
    try{
      //prevent theMachine.checkStartValue from overwriting startValue while paused
        conditions[resourceSpent][resourceSpent + 'CountUpAnim'].frameVal = conditions[resourceSpent].startValue;
      }catch(e){}
      
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
    let resourceSpent = 'heat';
    let countUpName =  resource + 'CountUpAnim';
    //check if adding workers
    if (event.target.innerHTML === '+') {
      //check if there's any workers left in global pool
      if (globalData.globalWorkersAvailable > 0) {
        //check if resource cap is not exceeded
        if (conditions[resource].workersAssigned < conditions[resource].workerCap) {
          conditions[resource].workersAssigned += 1;
          globalData.globalWorkersAvailable -= 1;
          //5:1 ratio of resource rate vs heat drain rate... a lot of resources need need 1:1 would be too drastic.
          if (resource !== resourceSpent) {
            conditions[resourceSpent].ratePerSecond -= (conditions[resource].ratePerSecond / 5);
          }
        }
      }
    }
    
    //check if subtracting workers
    if (event.target.innerHTML === '-') {
      //check if there's any workers left in resource pool
      if (conditions[resource].workersAssigned > 0) {
        conditions[resource].workersAssigned -= 1;
        globalData.globalWorkersAvailable += 1;
        if (resource !== resourceSpent) {
          conditions[resourceSpent].ratePerSecond += (conditions[resource].ratePerSecond / 5);
        }
      }
    }
    
    theMachine.renderWorkers(resource);
    
    [resource, resourceSpent].forEach(function(elemnt){
      theMachine.checkStartValue(elemnt, elemnt + 'CountUpAnim'); 
    });
    
    //if resource is not heat && there is enough heat to animate resource
    if (resource !== resourceSpent) {
      if (conditions[resourceSpent].startValue > 0) {
        theMachine.animateCountUp(resource, countUpName, conditions[resource].counterElement);
      }
    }
    //we're always going to need to animate heat because everything costs heat
    theMachine.animateCountUp(resourceSpent, resourceSpent + 'CountUpAnim', conditions[resourceSpent].counterElement);
    
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
};
