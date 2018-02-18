#!/usr/bin/env node
/*
 * ping-agent.js
 * Pings hosts and records their status to a Redis store.
 *
 * Usage:
 *   Specify a configuration file on the command line. See config.json for
 *   a sample. The default config.json is used if not provided. Optional
 *   argument -q for quiet mode.
 *   Run
 *     [sudo] node ping-agent [-c config] [-q]
 *
 * Note: Because creating ICMP packets requires low level socket access,
 * you will probably have to run this as root.
 */

var _ = require('lodash');
var ping = require('net-ping');
var redis = require('redis');
var schedule = require('node-schedule');
var argv = require('minimist')(process.argv.slice(2));

var quiet = argv.q ? true : false;

var EXPIRE_TIME = 120;            // Expire time in seconds
var CRON_TIME = '*/1 * * * *';    // Cron-style time to run this
var DEFAULT_IDENTIFIER = 'ping-agent';

function log(str) {
  if (!quiet) {
    console.log(str);
  }
}

log('Ping Agent');
// See if a -c option was given and we need to use a file path or just
// open the default config.
if (argv.c) {
  log('Using config file ' + argv.c);
  try {
    var config = require(argv.c);
  }
  catch (e) {
    config = require('./' + argv.c);
  }
}
else {
  log('Using config file config.js');
  config = require('./config');
}

var identifier = config.identifier || DEFAULT_IDENTIFIER;

var client = redis.createClient();
client.on('error', function(err) {
  log('Redis error: ' + err);
});

log('I\'ll be pinging the following hosts...');
_.forEach(config.hosts, function(host) {
  log(host.description + ' (' + host.hostname + ')');
});

// Have the agent check in to Redis first
client.set('ping-agent', 'ok', function(err, res) {
  client.expire('ping-agent', EXPIRE_TIME);
});


var session = ping.createSession();

schedule.scheduleJob(CRON_TIME, function() {

  // Write own status to the redis store
  client.set(identifier, 'ok', function(err, res) {
    client.expire(identifier, EXPIRE_TIME);
  });


  _.forEach(config.hosts, function(host) {

    log('Pinging ' + host.description + ' (' + host.hostname + ')');
    session.pingHost(host.hostname, function(err, target, sent, rcvd) {
      if (err) {
        log('Host ' + host.description + ' (' + host.hostname + ') is not responding to pings. ' + err.message);
        client.set(host.redisKey, 'down', function(err, res) {
          client.expire(host.redisKey, EXPIRE_TIME);
        });
      }
      else {
        log('Host ' + host.description + ' is alive');
        client.set(host.redisKey, 'ok', function(err, res) {
          client.expire(host.redisKey, EXPIRE_TIME);
        });
      }
    }); // session.pingHost
  }); // forEach
}); // scheduleJob
