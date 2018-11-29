var theMachine = {
  init:function() {
    if (!this.conditions) {
      this.conditions = theMachine.store('todos-jquery');
      this.heatCounter = document.getElementById("heat-counter");
      //CountUp params element,start value, end value, number of decimals, duration, options object
      this.startValue = 0;
      this.endValue = 10;
      this.ratePerSecond = 1;
      this.duration = this.endValue / this.ratePerSecond;
      this.numAnim = new CountUp(this.heatCounter, this.startValue, this.endValue,0,this.duration,{useEasing:false, suffix: ' / '+ this.endValue, gradientColors: ["white", "#F5F5F5"], ratePerSecond: this.ratePerSecond});
      if (!this.numAnim.error) {
          window.onload = this.numAnim.start();
      } else {
          console.error(this.numAnim.error);
      }
    }
  },

  store: function (namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  },

  pause: function() {
    numAnim.pauseResume();
  },

  updateCounter: function(event) {
    /**
    * this function will increase the heat capacity by +10  or rate/second by 1 each time it is called
    * depending which element is clicked in the DOM
    **/

    //gather current state information from the DOM
    this.startValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[0].trim());
    if (event.target.innerHTML === 'Item Capacity') {
      this.endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim())+10;
    } else {
    this.endValue = parseInt(document.getElementById('heat-counter').innerHTML.split("/")[1].trim());
    }
    if (event.target.innerHTML === 'Job Speed') {
     this.ratePerSecond = parseInt(document.getElementById("heat-rate").innerHTML.split(" ")[1].trim())+1; 
    } else {
      this.ratePerSecond = parseInt(document.getElementById("heat-rate").innerHTML.split(" ")[1].trim());
    }
    this.duration = (this.endValue - this.startValue) / this.ratePerSecond;
    //reset previous animation, because it will continue to run in the background otherwise
    this.numAnim.reset();

    //call a new animation with updated values
    this.numAnim = new CountUp(this.heatCounter, this.startValue, this.endValue,0,this.duration,{useEasing:false, suffix: ' / '+ this.endValue, gradientColors: ["white", "#BEBEBE"], ratePerSecond:this.ratePerSecond});
    if (!this.numAnim.error) {
        window.onload = this.numAnim.start();
    } else {
        console.error(this.numAnim.error);
    }
  }
}

theMachine.init();
