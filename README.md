tmp-reaper
==========

Reap old files from directories

## Installation

_will be added when published on npm_

## Example

```javascript
  var Reaper = require('tmp-reaper');

  var reaper = new Reaper({
    threshold: 2000,
    recursive: true
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

* `threshold` {integer} maximum lifetime of files (default to `7days`).
* `recursive` {boolean} reap subfolders (default to `false`).
* `every` {integer} period of time between each files check. If not provided, directories will be reaped only once.

#### Events

* `delete(filepath, stats)` When a file has been deleted.
* `error(err)` When an error occurs.

#### Methods

* `watch(dir)` add a directory to be watched for old files.
* `unwatch(dir)` stop watching the given directory.
* `start()` start reaping.
* `stop()` stop reaping.

### Time format
Can be a number of milliseconds or a string.
Strings are pretty permissive as they just need to contain numbers followed by a text.

_will add details soon_
