let templates = {
  
  createResourceBarHTML() {
  /**this function is an attempt at making a javascript template
  *handlebars at it's face seems more complicated than doing
  *this without a library.
  *After giving this a try I'll have a better point of reference.
  **/
  let theMachine = document.getElementById("body");
  let section = document.createElement("section");
  section.id="tanks";
  section.className="machine-parts";
  section.innerHTML=`<section id="heat">
        <in-line-group>
          <button type="button" id="heat+">+</button>
          <button type="button" id="heat-">-</button>
          <!- add hammer and wrentch logo ->

          <div class="resource-bar" id="heat-bar">
            <div id="heat-text">Heat</div>
            <div id="heat-counter"></div>
          </div>
        </in-line-group>
        
        <in-line-group>
            <div id="heat-rate"><b>Rate:</b> unknown</div>
            <div id="heat-time"><b>Time remaining:</b> unknown</div>
            <div id="heat-seconds-remaining">seconds</div>
        </in-line-group>  
        
        
        <br>
      </section>
      <!- css handled by collapse.css ->
           <button class="collapsible">+/-</button>
        <div class="content" style="display: none">
          <button class="modify-buttons" type="button" id="heat-pause" onclick="pause()">Pause</button>
          <button class="modify-buttons" type="button" onclick="jobSpeed()">Job Speed</button>
          <button class="modify-buttons" type="button" onclick="itemCapacity()">Item Capacity</button>
        </div>
    `
  theMachine.appendChild(section);
  
  //TODO: add .replace() and chain for each item to replace
  //modify text with mustaches {{ }}
  //{{resource-name}} example id="{{resource-name}}-pause"
  //section.replace({{resource-name}}, tanks) ==> id="tanks-pause"
  //useing replace / regex in this way will create a template
  // modify createResourceBarHTML() function to take the parameters to be replaced
  //that are unqiue to each resource bar (heat, tanks, klins, fuel, fluid, etc, etc)
  //google vanilla javascript template or some such to find a good example
  
  //TODO: call createReourceBarHTML() on document.load or as a self invoking function??
  //make sure creating elements with templating still starts the counters
  
  //TODO: add some logic behind adding resources beyond heat (start with heat and add more as they get unlocked)

  },
  renderFooter() {
    
    let footerElement = document.createElement("footer");
    
    footerElement.innerHTML = `
    <footer>
      <button class="footer-buttons" type="button" onclick="location.href='/'">Craft</button>
      <button class="footer-buttons" type="button" onclick="location.href='/research'">Research</button>
      <button class="footer-buttons" type="button" onclick="location.href='/log'">Log</button>
      <button class="footer-buttons" type="button" onclick="location.href='/explore'">Explore</button>
    </footer>
      `
    document.body.appendChild(footerElement);
  }
};

templates.renderFooter();