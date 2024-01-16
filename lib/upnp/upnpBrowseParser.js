var Xml2js = require('xml2js');

const MediaObject = require('./mediaObject.js').MediaObject

function UpnpBrowseParser() {
}

UpnpBrowseParser.prototype.isFolder = function(didlType) {
  const didlFolderTypeMap = {
    'object.container.storageFolder': true,
    "object.container.album.musicAlbum": true,
    "object.container.person.musicArtist": true,
    'object.item.audioItem.musicTrack': false
  }

  return didlFolderTypeMap[didlType];
};

UpnpBrowseParser.prototype.arrayField = function(name, obj, defaultVal) {
  let childObj = obj[name]; 
  
  if(!childObj) {
    return defaultVal;
  }
  
  return childObj[0] || defaultVal
};

UpnpBrowseParser.prototype.mediaObjectFromDidl = function(didl) {
  return new MediaObject(
    didl['$'].id,
    didl['dc:title'][0],
    this.arrayField('res', didl, {})._,
    this.arrayField('upnp:albumArtURI', didl, undefined),
    this.isFolder(this.arrayField('upnp:class', didl)))
};

UpnpBrowseParser.prototype.mediaObjectsFromDidl = function(didlArray) {
  let result = [];
  
  if(didlArray) {
    didlArray.forEach((didl) => {
      result.push(this.mediaObjectFromDidl(didl))
    })
  } 
  
  return result;
};

UpnpBrowseParser.prototype.parseBrowseDidl = function(jsonDidl) {
  return this.mediaObjectsFromDidl(jsonDidl['DIDL-Lite'].container)
    .concat(this.mediaObjectsFromDidl(jsonDidl['DIDL-Lite'].item))
};

UpnpBrowseParser.prototype.parse = function(response, cbFunc) {
  let self = this;
  
  Xml2js.parseString(response.Result, function(err, result) {
    cbFunc(err, self.parseBrowseDidl(result))
  });
};

module.exports.UpnpBrowseParser = UpnpBrowseParser;