This is a clone of the Armory & Machine mobile app, recreated as a javascript web app.

Fancy bits:
1) Written entirely in javascript - no frameworks.
2) The only javascript library in use is countUp.js, other features are built by hand.
2) Templating
3) Routing
4) DRY code base
5) Testing
6) Event delegation
7) It uses window.addEventListener('beforeunload') to record the time the page/game was left.  Resources continue to accumulate in real time (as calculated when the game is reopened).
