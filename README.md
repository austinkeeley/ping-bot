ping-bot
===========

Pings hosts and writes back to a redis cache.

Note that the ping library needs root access and if you need to run this with
something like pm2, things get dumb and it won't show up in your normal
pm2 list. Solution is to use the wrapper executable. 

    npm install
    make  # will prompt for root password to do setuid
    ./ping-bot-wrapper
