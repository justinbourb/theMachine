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
  let templateHTML = `<section id="{{resource}}">
        <in-line-group>
          <button type="button" data-resource="{{resource}}" class="enableAutomation" id="{{resource}}Manual" style="visibility:hidden" onclick="theMachine.manualCounterButton(event)">{{resource}}</button>
          <button type="button" data-resource="{{resource}}" id="{{resource}}+" onclick="theMachine.workerButtons(event)">+</button>
          <button type="button" data-resource="{{resource}}" id="{{resource}}-" onclick="theMachine.workerButtons(event)">-</button>
          <div class="workers" id="{{resource}}WorkerCount" data-resource="{{resource}}">0/5</div>  
          <!- add hammer and wrentch logo ->

          <div class="resource-bar" id="{{resource}}Bar">
            <div id="{{resource}}Text">{{resource}}</div>
            <div id="{{resource}}CountUpAnim" data-resource="{{resource}}"></div>
          </div>
          
          <button type="button" data-resource="{{resource}}" class="enableAutomation" id="{{resource}}AutomationButton" onclick="theMachine.automationButton(event)">Disable Automation</button>
        </in-line-group>
        
        <in-line-group>
          <div>
            <div id="{{resource}}Rate"><b>Rate:</b> unknown</div>
            <div id="{{resource}}Time"><b>Time remaining:</b> unknown</div>
            <div id="{{resource}}CountUpAnimManual" data-resource="{{resource}}"></div>
          </div>
        </in-line-group>  
        
        
        <br>
      <!- css handled by collapse.css ->
        <button class="collapsible">+/-</button>
        <div class="content" style="display: none">
          <div class="contentTop">
            <div class="contentFloatLeft">
              <div id="{{resource}}ItemCap" data-resource="{{resource}}">Item Cap: unknown</div>
              <div id="{{resource}}ProductionTime" data-resource="{{resource}}">Production Time: <b>4s</b></div>
              <div id="{{resource}}ProductionVolume" data-resource="{{resource}}">Production Volume: <b>1</b></div>
            </div>
            <div class="contentFloatRight">
              <div id="{{resource}}WorkerCap" data-resource="{{resource}}">Worker Cap: unknown</div>
              <div id="{{resource}}AutomationRate" data-resource="{{resource}}">Automation Rate: unknown</div>

              <div id="{{resource}}WorkerEfficiency" data-resource="{{resource}}">Worker Efficiency: unknown</div>
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
          </div>
        </div>
      </section>
    `;
  section.id = "tanks";
  section.className = "machine-parts";
  let updatedTemplateHTML = templateHTML.replace(regex, resource);
  section.innerHTML = updatedTemplateHTML;
  targetElement.appendChild(section);
  document.getElementById(resource + "Text").innerHTML = resource.charAt(0).toUpperCase() + resource.slice(1,);
  //add resource calculated values (DOM elements, etc)
  theMachine.calculateValues('init');
  
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
  }
};

templates.renderFooter();

