function infoButtonMouseOver(event){
  /*
  Purpose: This function will show the information when the users
  mouse hovers over the info button.
  Input: a javascript event
  */
    //gets the id of the element which triggered mouse over
    let resource = event.target.id
    //get the child element (the info paragraph) and display the text
    //document.getElementById(resource).children[1].style.display="block"
    event.fromElement.children[1].style.display="block"
  }

function infoButtonMouseOut(event){
    /*
    Purpose: This function will hide the information when the users
    mouse leaves the info button area.
    Input: a javascript event
    */
    //gets the id of the element which triggered mouse over
    let resource = event.currentTarget.id
    //get the child element (the info paragraph) and hide the text
    //document.getElementById(resource).children[1].style.display="none"
    event.relatedTarget.children[1].style.display="none"
  }