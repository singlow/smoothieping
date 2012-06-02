SmoothiePing
------------
A smoothie chart visualization of NodePing status check run time reports.

As I was tweaking the performance of a bunch of client websites, I wanted to quickly see how they
were all performing. I signed up for NodePing but I found the dashboard to be a little to boring, 
so I built my own.

View [demo][1].

Features
--------
- Real time updates
- JSON result proxy and caching in Node.js with flatiron
- Per server/check display toggling
- Per server/check highlighting 

Installation
------------
Install [node][2]

git clone git://github.com/singlow/smoothieping.git

cd smoothieping && npm install

node smoothie-ping.js

Modify public/js/sites.json to include the settings for your NodePing checks.

Visit http://localhost:8080/

[1]:http://iakob.com/smoothieping/demo
[2]:https://github.com/joyent/node/wiki/Installation

