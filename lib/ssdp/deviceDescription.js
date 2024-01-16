var Xml2js = require('xml2js');
const axios = require('axios');

function DeviceDescription(deviceDescriptionUrl, id) {
  this._deviceDescriptionUrl = deviceDescriptionUrl;
  this._id = id;
}

DeviceDescription.prototype.url = function() {
  return this._deviceDescriptionUrl;  
}

DeviceDescription.prototype.id = function() {
  return this._id;  
}

DeviceDescription.prototype.friendlyName = function() {
  return this._friendlyName;  
}

DeviceDescription.prototype.artworkUrl = function() {
  return this._artworkUrl;  
}

DeviceDescription.prototype.baseUrl = function() {
  let url = new URL(this._deviceDescriptionUrl)
  return url.origin;  
}

DeviceDescription.prototype.storeResponse = function(obj) {
  this._friendlyName = obj.root.device[0].friendlyName[0];
  this._artworkUrl = this.baseUrl() + obj.root.device[0].iconList[0].icon[0].url[0];
}

DeviceDescription.prototype.parseResponse = function(response, cbFunc) {
  let self = this;
  Xml2js.parseString(response.data, (err, result) => {
    self.storeResponse(result)            
    cbFunc(err)
  });      
}

DeviceDescription.prototype.fetch = function(cbFunc) {
  let self = this;
  
  axios.get(this._deviceDescriptionUrl)
    .then((response) => {
      self.parseResponse(response, cbFunc)     
    })
    .catch((err) => {
      // handle error
      cbFunc(err);
    })
}

module.exports.DeviceDescription = DeviceDescription;