const MediaType = require('./mediaObject.js').MediaType

function MediaFetcher(upnpClient, parser) {
  this.upnpClient = upnpClient;
  this.parser = parser
}

MediaFetcher.prototype.fetchMediaObjectsFrom = function(id, startingIndex, cbFunc) {
  this.upnpClient.browse(id, startingIndex, (err, result) => {
    if(err) {
      cbFunc(err)
    } else {
      this.parser.parse(result, cbFunc)
    }
  });
};

module.exports.MediaFetcher = MediaFetcher