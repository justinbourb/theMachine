This is a clone of the Armory & Machine mobile app, recreated as a javascript web app.  Armory & Machine is an incremental game, additional content is unlocked as progress is made.

You can view a live demo here: https://tin-random.glitch.me/

Fancy bits:
1) Written entirely in javascript - no frameworks.
2) The only javascript library in use is countUp.js, other features are built by hand.  
  2a) resource counters are created via countUp.js using window.requestAnimationFrame()
3) Templating
4) Routing
5) DRY code base
6) Testing (139 tests)  
  6a) tests can be accessed by navigating to /tests
7) Event delegation
8) It uses window.addEventListener('beforeunload') to record the time the page/game was left.  Resources continue to accumulate in real time (as calculated when the game is reopened).
9) Contains at least one example of functional programming
10) Cheat codes are available to jump to the next breakpoint type levelUp() in the console or if you want a fresh start, type restart()  
11) Intentionally minimalist UI (true to the original app)

Full description:

The game start with only one resource, heat.  Heat can only be generated  manually at this point.
<img src="https://github.com/justinbourb/theMachine/blob/master/images/game_start.JPG">]  
  
The first break point is upon reaching 5 heat.  The footer navigation bar appears and researching your next resource, tanks, is now available.  Upon researching tanks, increasing resource rate and capacity also becomes available.  At this point resource generation is still manual.  
  
<img src="https://github.com/justinbourb/theMachine/blob/master/images/5_heat.JPG">]  
  
The second break point is upon reaching 50 heat. Workers research becomes available.  This unlocks automation, the header navigation bar and the creation of additional workers on the armory page (accessed via header navigation bar).  Workers get assigned to resources allowing automated generation over time.  All resources require heat and rate per second will vary based on how many workers are assigned and how much heat is being drained.  
<img src="https://github.com/justinbourb/theMachine/blob/master/images/research_available.JPG">]  
  
One cool feature that gets unlocked behind the scenes is resource generation will continue after you leave the page (up to maximum or down to zero).  There is an algorithm which calculates resource generation over time based on when you left the page. The second cool feature that gets unlocked behind the scences is resource generation will automatically stop if heat drops to 0 and automatically restart once heat > 0.  
  
<img src="https://github.com/justinbourb/theMachine/blob/master/images/automation_available.JPG">]  
  
The third break point is upon reaching 500 heat.  Klins are unlocked via the research page, which allows increasing the worker capacity of resources.  
<img src="https://github.com/justinbourb/theMachine/blob/master/images/klins_available.JPG">]  
  
The fourth break point is upon reaching 5000 heat.  Fluid is unlocked via the research page, which allows increasing worker efficiency.  
<img src="https://github.com/justinbourb/theMachine/blob/master/images/fluid_available.JPG">]  
  

