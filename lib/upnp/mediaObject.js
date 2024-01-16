
function MediaObject(id, name, mediaUrl,artworkUrl, isFolder) {
  this.id = id;
  this.name = name;
  this.mediaUrl = mediaUrl;
  this.artworkUrl = artworkUrl;
  
  if(isFolder) {
    this.children = [];
  }
}

MediaObject.prototype.hasChildren = function() {
  return this.children !== undefined
}

MediaObject.prototype.addChildren = function(children) {
  this.children = this.children.concat(children)
  return this;
}

MediaObject.prototype.addChild = function(child) {
  this.children.push(child)
  return this;
}

module.exports.MediaObject = MediaObject
