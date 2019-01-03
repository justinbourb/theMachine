/**TODO:
*2) improve the look when displaying content, add some css transisition thing?
*  2a) make the content "slide" out -- see the machine app for proper styling
**/
let collapse = {
  collapseEventListener () {
    document.querySelector('body').addEventListener('click', function(event) {
      if (event.target.className === 'collapsible') {
        //this.classList.toggle("active");
        let content = document.getElementsByClassName('content');
        let contentArray = Array.from(content);
        //check which element with class = 'content' to unhide.
        contentArray.forEach(function(element){
          if (event.target.dataset.resource === element.dataset.resource) {
            if (element.style.display === "flex") {
              element.style.display = "none";
            } else {
              element.style.display = "flex";
            }
          //hide anything not clicked on => the machine app only allows one drop down to be open at a time
          } else {
            element.style.display = "none";
          }
        });
      }
    });
  }
}

collapse.collapseEventListener();