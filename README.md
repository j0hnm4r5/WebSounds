# WebSounds
=========

##Sounds for the Web

There are two projects so far, both running on Node.js using WebSockets. You can find them in public.

Piano is the most interesting of the two, [see it in action](http://websounds.john-mars.com/piano).


## About WebSounds/piano

WebSounds/piano is an interactive, collaborative music making machine.

## How to play

Use your keyboard or mouse to hit the notes, and play along with everyone else. You can see who's playing what by looking at the piano roll along the bottom, and paying attention to the lights up top.

Notes gradually turn red the more you play them, and the background gets lighter the more people are playing.

## About the technology.

The app uses [node.js]("http://nodejs.org/") and [socket.io]("http://socket.io/") to connect users. Sound is generated in-browser using [jsfx]("https://github.com/egonelbre/jsfx"). WebSounds/piano runs on [heroku]("http://www.heroku.com"). It was designed by [John Mars]("http://www.john-mars.com") for Experimental Data Representation, a course at [RISD]("http://risd.edu/") in Spring 2014.
