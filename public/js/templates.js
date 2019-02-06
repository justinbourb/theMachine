let templates = {
  //TODO: add header script tags to a template
  
  
  createResourceBarHTML(resource) {
  /**
  * this function creates a "resource" based on the html template below
  * must be called with the name of the resource you wish to create
  **/
    
  /**TODO:
  *1) attach to machine parts instead of body
  *2) figure out why scripts are not working properly for tanks elements
  *  2a) theMachine scripts should all be DRY and accept any resource name.
  *3) Can this be improved to read the html in index.html so there's one source of truth?
  *  3a) replace index.html text with template below so there's one source of truth?
  *4) createResourceBarHTML based on url (craft page, hunter page, soldier page, scientist page, etc);
  *  4a) only add craft resourceBars on craft page, etc
  *    4a1) if (url === craft && research is complete ) { createResourceBarHTML('heat', 'tanks', 'kilns', 'liquid') };
  **/
    
  let targetElement = document.getElementById("The-Machine");
  let section = document.createElement("section");
  let regex = /{{resource}}/gi;
  let templateHTML = `
      <section class="machine-parts" id="{{resource}}">
        <in-line-group>
          <button type="button" data-resource="{{resource}}" class="enableAutomation" id="{{resource}}Manual" style="display: none" onclick="theMachine.manualCounterButton(event)">{{resource}}</button>
          <button type="button" data-resource="{{resource}}" class="resourcePlus" id="{{resource}}Plus" onclick="theMachine.workerButtons(event)">+</button>
          <button type="button" data-resource="{{resource}}" id="{{resource}}Minus" onclick="theMachine.workerButtons(event)">-</button>
          <div class="workers" id="{{resource}}WorkerCount" data-resource="{{resource}}">0/5</div>  
          <!- add hammer and wrentch logo ->

          <div class="resourceBar" id="{{resource}}Bar">
            <div class="resourceText" id="{{resource}}Text">{{resource}}</div>
            <div class="resourceCountUpAnim" id="{{resource}}CountUpAnim" data-resource="{{resource}}"></div>
          </div>
          
          <button type="button" data-resource="{{resource}}" class="enableAutomation" id="{{resource}}AutomationButton" onclick="theMachine.automationButton(event)">Disable Automation</button>
        </in-line-group>
        
        <in-line-group>
          <div>
            <div class="resourceRate" id="{{resource}}Rate"><b>Rate:</b> unknown</div>
            <div class="resourceTime" id="{{resource}}Time"><b>Time remaining:</b> unknown</div>
            <div class="resourceCountUpAnimManual" id="{{resource}}CountUpAnimManual" data-resource="{{resource}}"></div>
          </div>
        </in-line-group>  
        
        
        <br>
        <!- css handled by collapse.css ->
        <button class="collapsible" id="{{resource}}Collapsible" data-resource="{{resource}}">+/-</button>
        <div class="content" id="{{resource}}CollapsibleContent" style="display: none" data-resource="{{resource}}">
          <div class="contentTop">
            <div class="contentFloatLeft">
              <div id="{{resource}}ItemCap" data-resource="{{resource}}">Item Cap: unknown</div>
              <div class="resourceProductionTime" id="{{resource}}ProductionTime" data-resource="{{resource}}">Production Time: <b>4s</b></div>
              <div class="resourceProductionVolume" id="{{resource}}ProductionVolume" data-resource="{{resource}}">Production Volume: <b>1</b></div>
            </div>
            <div class="contentFloatRight">
              <div id="{{resource}}WorkerCap" data-resource="{{resource}}">Worker Cap: unknown</div>
              <div class="resourceAutomationRate" id="{{resource}}AutomationRate" data-resource="{{resource}}">Automation Rate: unknown</div>

              <div class="resourceWorkerEfficiency" id="{{resource}}WorkerEfficiency" data-resource="{{resource}}">Worker Efficiency: unknown</div>
            </div>
          </div>
          <div class="contentBottom">
            <div class="contentFloatLeft">
              <div class="smallText" id="{{resource}}JobCost">Cost: unknown {{resource}}</div>
              <button class="modify-buttons" data-resource="{{resource}}" type="button" onclick="theMachine.updateCounterButtons(event)">Job Speed</button>
              <div class="smallText" id="{{resource}}JobLevel">Level: unknown</div>
              <div class="smallText" id="{{resource}}NextRate">Next: unknown</div>
            </div>
            <div class="contentFloatRight">
              <div class="smallText" id="{{resource}}ItemCost">Cost: unknown Tanks</div>
              <button class="modify-buttons" data-resource="{{resource}}" type="button" onclick="theMachine.updateCounterButtons(event)">Item Capacity</button>
              <div class="smallText" id="{{resource}}ItemLevel">Level: unknown</div>
              <div class="smallText" id="{{resource}}NextItem">Next:  unknown</div>
            </div>
            <div class="contentFloatRight">
              <div class="smallText" id="{{resource}}KlinsCost">Cost: unknown Klins</div>
              <button class="modify-buttons" data-resource="{{resource}}" type="button" onclick="theMachine.updateCounterButtons(event)">Worker Capacity</button>
              <div class="smallText" id="{{resource}}KlinsLevel">Level: unknown</div>
              <div class="smallText" id="{{resource}}NextKlins">Next:  unknown</div>
            </div>
            <div class="contentFloatRight">
              <div class="smallText" id="{{resource}}FluidCost">Cost: unknown Fluid</div>
              <button class="modify-buttons" data-resource="{{resource}}" type="button" onclick="theMachine.updateCounterButtons(event)">Increase Efficiency</button>
              <div class="smallText" id="{{resource}}FluidLevel">Level: unknown</div>
              <div class="smallText" id="{{resource}}NextFluid">Next:  unknown</div>
            </div>
          </div>
        </div>
      </section>
    `;

  let updatedTemplateHTML = templateHTML.replace(regex, resource);

  targetElement.innerHTML += updatedTemplateHTML;
  document.getElementById(resource + "Text").innerHTML = resource.charAt(0).toUpperCase() + resource.slice(1,);
  },
  
  renderFooter() {
    /*
    *This function will create links at the bottom of each page aka the footer.
    */
    
    let footerElement = document.createElement("footer");
    
    footerElement.innerHTML = `
      <!- css handled by footer.css ->
      <button class="footer-buttons" type="button" onclick="controllers.whichLinkClicked(event)">Craft</button>
      <button class="footer-buttons" type="button" onclick="controllers.whichLinkClicked(event)">Research</button>
      <button class="footer-buttons" type="button" onclick="controllers.whichLinkClicked(event)">Log</button>
      <button class="footer-buttons" type="button" onclick="controllers.whichLinkClicked(event)">Explore</button>
    `
    document.body.appendChild(footerElement);
  },
  
  renderHeader() {
    let headerElement = document.getElementById('header_navigation');
    
    if (location.href.split('/').slice(-1)[0].toLowerCase() === 'research') {
      headerElement.innerHTML = `
      <div style="background: grey; height: 2em; width: 100%;">
        <h2 style="margin:0;"> Research </h2>
      </div>
      `
    } else {
    headerElement.innerHTML = `
      <div style="background: grey; height: 2em; width: 100%;">
        <a href="/">
          <img style="height:2em; padding-left: 0.5%" src="https://www.drawing-pencil-sketches.com/images/198xNxhow-to-draw-a-flame.gif.pagespeed.ic.VfDm_nppu7.jpg">
        </a>

        <a href="/armory" style="height:2em; padding-left: 0.5%">
          <img style="height:2em" src="https://previews.123rf.com/images/elnurss/elnurss1809/elnurss180903195/109840269-oil-drum-vector-icon.jpg">
        </a>
      </div>
    `
    }
  }
};

templates.renderFooter();

