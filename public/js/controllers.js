let controllers = {
  whichLinkClicked(event) {
    /** TODO: Build out this function
    *        1) figure out where/how wasPageLeft gets set
    *          1a) also set it here before storing conditions
    *
    * Goals of this function:
    * 1) if on theMachine page (craft), save conditions when following any of the links.
    *   1a) I think my beforeunload eventListener is not saving properly.
    *      I want to test this out to see if it works... if not I'll just keep this code in controllers.js for organization reasons
    * 2) If on any other page, just follow the link
    **/
    
    //save conditions first if we're on the craft page
    if (location.href === '/') {
      theMachine.store('theMachine', conditions);
    }
    //next follow the links
    if (event.target.innerHTML === 'Craft') {
      location.href = '/';
    } else {
     location.href = '/' + event.target.innerHTML;
    }
    
  }
};