'use strict';

/**
 * TmpReaper provides methods to reap old files from directories
 */

var fs           = require('fs');
var path         = require('path');
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var ms           = require('./ms.js');

/**
 * Initialize a new Reaper with given options
 * @param {Object} options -> threshold     : lifetime of files
 *                         -> recursive     : if set to true, will reap files in subfolders
 *                         -> keepEmptyDirs : if set to true, will keep dir even when it's empty
 *                         -> filetime      : filetime to use as reference
 *                                            can be : atime, mtime or ctime
 *                         -> every         : period of time between each reap session
 *                                            if not set, reap only once
 *                         -> pattern       : only reap files matching the pattern
 */
var TmpReaper = function (options) {
  options            = options || {};
  this.recursive     = options.recursive     || false;
  this.keepEmptyDirs = options.keepEmptyDirs || false;
  this.threshold     = ms(options.threshold  || '7days');
  this.cycle         = ms(options.every);
  this.dirs          = [];
  this.filetime      = /^[acm]time$/i.test(options.filetime) ? options.filetime.toLowerCase() : 'mtime';

  if (typeof options.pattern === "string") {
    this.pattern = new RegExp(options.pattern);
  } else if(typeof options.pattern === "object") {
    this.pattern = options.pattern;
  } else {
    this.pattern = false;
  }
};

util.inherits(TmpReaper, EventEmitter);
module.exports = TmpReaper;

/**
 * Reap old files from a directory
 * @param  {String} dir path to dir
 */
TmpReaper.prototype.reapDir = function (dir, callback) {
  var self = this;
  callback = callback || function () {};

  fs.readdir(dir, function (err, files) {
    if (err) {
      self.emit('error', err);
      return callback(false);
    }

    var nbFiles = files.length;

    if (nbFiles === 0) { return callback(true); }

    (function processNextFile() {
      var f = files.pop();
      if (!f) { return callback(nbFiles === 0); }

      var file = path.join(dir, f);

      fs.stat(file, function (err, stats) {
        if (err) {
          self.emit('error', err);
          return processNextFile();
        }

        if (stats.isDirectory()) {
          if (!self.recursive) { return processNextFile(); }

          self.reapDir(file, function (empty) {
            if (!empty || self.keepEmptyDirs) { return processNextFile(); }

            fs.rmdir(file, function (err) {
              if (err) { self.emit('error', err); }
              else     { nbFiles--; }
              processNextFile();
            });
          });
        } else {
          if (self.pattern !== false && !self.pattern.test(f)) {
            return processNextFile();
          }

          var diff = new Date() - stats[self.filetime];

          if (diff < self.threshold) { return processNextFile(); }

          fs.unlink(file, function (err) {
            if (err) {
              self.emit('error', err);
              return processNextFile();
            }
            self.emit('delete', file, stats);
            nbFiles--;
            processNextFile();
          });
        }
      });
    })();
  });

  return self;
};

/**
 * Reap each watched dir
 */
TmpReaper.prototype.reap = function () {
  var self = this;

  self.dirs.forEach(function (dir) {
    fs.stat(dir, function (err, stats) {
      if (err) { return self.emit('error', err); }

      if (stats.isDirectory()) {
        self.reapDir(dir);
      } else {
        self.emit('error', new Error('Not a directory : ' + dir));
      }
    });
  });
};

/**
 * Add a directory to the watching list
 * @param {String} dir
 */
TmpReaper.prototype.watch = function (dir) {
  this.dirs.push(path.normalize(dir));
  return this;
};

/**
 * Remove a directory from the watching list
 * @param {String} dir
 */
TmpReaper.prototype.unwatch = function (dir) {
  var i = this.dirs.indexOf(path.normalize(dir));
  if (i > -1) { this.dirs.splice(i, 1); }
  return this;
};

/**
 * Start reaping
 */
TmpReaper.prototype.start = function () {
  var self = this;

  self.reap();
  if (self.cycle) { self.intervalID = setInterval(function () { self.reap(); }, self.cycle); }
  return self;
};

/**
 * Stop reaping periodically
 */
TmpReaper.prototype.stop = function () {
  if (this.intervalID) { clearInterval(this.intervalID); }
  return this;
};
