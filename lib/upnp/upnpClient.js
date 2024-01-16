var Client = require('upnp-device-client');

// 'http://192.168.1.112:8200/rootDesc.xml'
function UpnpClient(deviceDscriptionUrl) {
  // Instanciate a client with a device description URL (discovered by SSDP)
  this.client = new Client(deviceDscriptionUrl);
}

UpnpClient.prototype.getDeviceDescription = function(cbFunc) {
  this.client.getDeviceDescription(function(err, description) {
    // TODO validate description?
    cbFunc(err)
  });
};

UpnpClient.prototype.getServiceDescription = function(cbFunc) {
  this.client.getServiceDescription('ContentDirectory', function(err, description) {
    // TODO validate description?
    cbFunc(err)
  });
};

UpnpClient.prototype.search = function(id, cbFunc) {
  let arg = {
    ContainerID: id,
    SearchCriteria: '',
    Filter: '*',
    StartingIndex: 0,
    RequestedCount: 10000,
    SortCriteria: '+dc:title'  
  }
    
  this.client.callAction('ContentDirectory', 'Search', arg, cbFunc);  
};

UpnpClient.prototype.browse = function(id, startingIndex, cbFunc) {
	if ( startingIndex === undefined) {
		startingIndex = 0;
	}
  let arg = {
    // BrowseMetadata is an alternate value
    // But is not needed here.
    BrowseFlag: 'BrowseDirectChildren',  
    ObjectID: id,
    
    // We need the artwork and media url's 
    Filter:'upnp:albumArtURI,res',
    
    // Could be used to page responses if needed
    StartingIndex: startingIndex,
    RequestedCount: 10000,
    
    // I think default sort is ok.
    SortCriteria: ''
  }
  
  this.client.callAction('ContentDirectory', 'Browse', arg, cbFunc);
};

UpnpClient.prototype.start = function(cbFunc) {
  // Get a couple of descriptions from the service, mainly
  // just to check that we can talk to it. 
  this.getDeviceDescription((err) => {
    if (err) {
      cbFunc(err);
    } else {
      this.getServiceDescription(cbFunc);
    }
  });
};

module.exports.UpnpClient = UpnpClient;