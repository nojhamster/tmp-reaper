tmp-reaper
==========

Reap old files from directories

## Installation

```
npm install tmp-reaper
```

## Usage

```javascript
  var Reaper = require('tmp-reaper');

  var reaper = new Reaper({
    threshold: '1 day',
    every: '1 hour'
  });
  
  reaper.watch('/some/directory').start();
```

## Documentation

### Class: Reaper

Create a Reaper object.

```javascript
var Reaper = require('tmp-reaper');
var reaper = new Reaper(options);
```

#### Options

* `threshold` {string | integer} maximum lifetime of files (defaults to `7days`).
* `recursive` {boolean} reap files in subdirectories (defaults to `false`).
* `keepEmptyDirs` {boolean} preserve empty subdirectories (defaults to `false`).
* `every` {string | integer} period of time between each files check. If not provided, directories will be reaped only once.
* `filetime` {string} filetime to use as reference. Can be `atime`, `mtime` or `ctime`. (defaults to `mtime`)                                        
* `pattern` {string | regex} pattern that the filename has to match, else it will be skipped (optional)

Time format can be either a number of milliseconds or a string.
String format is pretty permissive as it only extract numbers followed by a text, with anything in-between.

Time unit | format
----------|-------
second    | s, sec, second, seconds
minute    | m, min, minute, minutes
hour      | h, hour, hours
day       | d, day, days

Example :
```javascript
var options = {
  threshold: '7 day and 2.5 hours',
  every: '1h20m30s'
}
```

#### Events

* `delete(filepath, stats)` when a file has been deleted.
* `error(err)` when an error occurs.

#### Methods

* `watch(dir)` add a directory to be watched for old files.
* `unwatch(dir)` stop watching the given directory.
* `start()` start reaping.
* `stop()` stop reaping.
