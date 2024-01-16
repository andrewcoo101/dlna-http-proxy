var ssdp = require('node-ssdp').Client

function SsdpClient(cbFunc) {
  this.client = new ssdp({})
  
  this.client.on('notify', function () {
    console.log('Got a notification.')
  })
  
  this.client.on('response', function inResponse(headers, code, rinfo) {
    if(code !== 200) {
      console.log("Ssdp client got an invalid code: " + code)
    }
    
    cbFunc(headers)
  })
}

SsdpClient.prototype.run = function(durationSeconds, cbFunc) {
  this.client.search('urn:schemas-upnp-org:service:ContentDirectory:1')

  setTimeout((localThis) => {
     localThis.client.stop()
     cbFunc();
  }, durationSeconds * 1000, this)
};

module.exports.SsdpClient = SsdpClient;
