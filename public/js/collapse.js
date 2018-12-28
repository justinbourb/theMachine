/**
* copied from https://www.w3schools.com/howto/howto_js_collapsible.asp
* this code will assign an event listener to all elements that
* need to be collapsible.
**/ 

/** FIXME: 
* 1) This code seems excessively complicated.  Why do a loop?
*    Just toggle the one element?
**/

/**TODO:
*1) try copied code to see if it's better
*  1a) measure performance somehow?
*2) improve the look when displaying content, add some css transisition thing?
*  2a) make the content "slide" out -- see the machine app for styling guide
**/

// let coll = document.getElementsByClassName("collapsible");
// let i;

// for (i = 0; i < coll.length; i++) {
//   coll[i].addEventListener("click", function() {
//     this.classList.toggle("active");
//     let content = this.nextElementSibling;
//     if (content.style.display === "flex") {
//       content.style.display = "none";
//     } else {
//       content.style.display = "flex";
//     }
//   });
// }

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