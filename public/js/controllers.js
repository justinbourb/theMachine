let controllers = {
  whichLinkClicked(event) {
    if (event.target.innerHTML === 'Craft') {
      location.href = '/';
    } else {
     location.href = '/' + event.target.innerHTML;
    }
  }
};