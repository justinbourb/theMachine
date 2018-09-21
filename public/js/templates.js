// <section id="heat">
//         <in-line-group>
//           <button type="button" id="heat+">+</button>
//           <button type="button" id="heat-">-</button>
//           <!- add hammer and wrentch logo ->

//           <div class="resource-bar" id="heat-bar">
//             <div id="heat-text">Heat</div>
//             <div id="heat-counter"></div>
//           </div>

// var para = document.createElement("p");
// var node = document.createTextNode("This is new.");
// para.appendChild(node);
// var element = document.getElementById("div1");
// element.appendChild(para);

function createResourceBarHTML(){
  //this function is an attempt at making a javascript template
  //handlebars at it's face seems more complicated than doing
  //this without a library.
  //After giving this a try I'll have a better point of reference.
  var theMachine = document.getElementById("The-Machine");
  var section = document.createElement("section");
  var inLineGroup = document.createElement("in-line-group");
  var what = "what about this"
  var testText = document.createTextNode("This is a test."+what);
  inLineGroup.appendChild(testText);
  section.appendChild(inLineGroup);
  theMachine.appendChild(section);
  
  //test results, elements successfully created and text successfully passed to DOM upon
  //calling this function in the console.
  //string + variable also works correctly for document.createTextNode(string + variable);
  //need to expand on this later for full templating.
  
  
}