/**
* copied from https://www.w3schools.com/howto/howto_js_collapsible.asp
* this code will assign an event listener to all elements that
* need to be collapsible.
**/ 

/** FIXME: 
* 1) This code seems excessively complicated.  Why do a loop?
*    Just toggle the one element?
**/

let coll = document.getElementsByClassName("collapsible");
let i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}
