var EventEmitter = require('events').EventEmitter;

var SsdpClient = require('./ssdpClient.js').SsdpClient
const DeviceDescription = require('./deviceDescription.js').DeviceDescription;

function SsdpRegistry(cbFunc) {
  this.eventEmitter = new EventEmitter();

  this._locations = {};
  this._ssdpClient = new SsdpClient((headers) => {
    let seenBefore = this._locations[headers.LOCATION] !== undefined;

    // TODO mechanism to re-use the same ids even when it's new
    let id = seenBefore 
      ? this._locations[headers.LOCATION].id()
      : Object.keys(this._locations).length + 1;
      
    this._locations[headers.LOCATION] = new DeviceDescription(headers.LOCATION, id);
    
    if(!seenBefore) {
      this.eventEmitter.emit('new', this._locations[headers.LOCATION] );
    } 
  });
}

SsdpRegistry.prototype.on = function(name, cbFunc) {
  this.eventEmitter.on(name, cbFunc)
};

SsdpRegistry.prototype.poll = function(durationSeconds, cbFunc) {
  this._ssdpClient.run(durationSeconds, cbFunc)
};

SsdpRegistry.prototype.locations = function() {
  return this._locations
};

module.exports.SsdpRegistry = SsdpRegistry;
