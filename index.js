const MediaObject = require('./lib/upnp/mediaObject.js').MediaObject;
const UpnpClient = require('./lib/upnp/upnpClient.js').UpnpClient
const UpnpBrowseParser = require('./lib/upnp/upnpBrowseParser.js').UpnpBrowseParser
const MediaFetcher = require('./lib/upnp/mediaFetcher.js').MediaFetcher
const SsdpRegistry = require('./lib/ssdp/ssdpRegistry.js').SsdpRegistry;

const express = require('express')
const app = express()

const port = 3000

let mediaFetchers = [];

let ssdpRegistry = new SsdpRegistry();

let rootMediaObject = new MediaObject('root', 'Servers', undefined, undefined, true);

ssdpRegistry.on('new', (deviceDescription) => {
  console.log(`Fetching device description ${deviceDescription.url()}`)

  deviceDescription.fetch((err) => {
    if (err) {
      console.error(`Failed to fetch device description ${deviceDescription.url()}: ${err}`)
    } else {
      let friendlyName = deviceDescription.friendlyName();
      let shortName = friendlyName.replaceAll(" ", "").replaceAll(":", "-");

      console.log(`Found device description: ${friendlyName}`)

      mediaFetchers[shortName] = new MediaFetcher(new UpnpClient(deviceDescription.url()), new UpnpBrowseParser())

      rootMediaObject.addChild(new MediaObject(
        shortName,
        friendlyName,
        undefined, undefined, true))
    }
  })
})

function ssdpRegistryPoll() {
  ssdpRegistry.poll(60, (err) => {
    if (err) {
      console.log('Failed to poll ssdp: ' + err)
    }
  });
}

ssdpRegistryPoll();

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

app.get('/', (req, res) => {
  let mediaId = req.query.mediaId;
  let heading = req.query.heading || "Network";
  let format = req.query.format || "html";
  let baseUrl = `${req.protocol}://${req.hostname}:${port}`;

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!mediaId) {
    res.contentType("text/html")

    let html = `<h1>${heading}</h1>`;

    rootMediaObject.children.forEach((child) => {
      html += `<a href="${baseUrl}/?format=${format}&mediaId=${child.id}&heading=${child.name}">${child.name}<\a><BR>\n`;
    })

    res.send(html)
    res.end()

    return;
  }

  let splitId = mediaId.split(':');

  let mediaFetcherIndex = splitId[0]
  let mediaFetcher = mediaFetchers[mediaFetcherIndex];
  if (mediaFetcher === undefined) {
    res.contentType("text/html")
    let html = `<h1>${heading}</h1>`;
    html += "Failed to find " + mediaFetcherIndex;
    res.send(html)
    res.end()
    return;
  }

  let mediaStoreId = splitId[1] !== undefined
    ? splitId[1]
    : '0';

  let mediaItems = [];
  let children = [];
  let episodes = {};
  let startingIndex = 0;
  let hasMedia = false;

  let fetchNextChunk = function(err, mediaObjects) {
    // TODO this can get stuck in a loop when fetching from mythtv
    // TODO jellyfin gets confused; folders have images and these are treated as the files to be downloaded.
    if (err) {
      console.log("Failed to fetch media: " + mediaId)
      res.send(JSON.stringify(rootMediaObject, null, 2))
      res.end()
      return true;
    }

    if (mediaObjects.length === 0) {
      console.log(`Done!`)
      res.contentType("text/html")
      let html = `<h1>${heading}</h1>`;

      if (hasMedia) {
        if (format != "wget") {
          html += `<a href="${baseUrl}/?format=wget&mediaId=${mediaId}&heading=${heading}">wget<\a><BR><BR>\n`
        }

        if (format != "html") {
          html += `<a href="${baseUrl}/?format=html&mediaId=${mediaId}&heading=${heading}">html<\a><BR><BR>\n`
        }
      }
      
      html += children.join("\n");
      html += "<BR>\n" + mediaItems.join("\n")

      res.send(html)
      res.end()

      return true;
    }

    for (let i = 0; i < mediaObjects.length; i++) {
      let child = mediaObjects[i];
      if (child.mediaUrl) {
        if (episodes[child.name] === undefined) {
          episodes[child.name] = 1;
        } else {
          if (episodes[child.name] === 1 && mediaObjects[i - 1].name === child.name) {
            mediaObjects[i - 1].name += ` s01e01`;
          }
          episodes[child.name]++;
          child.name += ` s01e${pad(episodes[child.name], 2)}`;
        }
      }
    };

    mediaObjects.forEach((child) => {
      startingIndex++;

      if (child.mediaUrl) {
        hasMedia = true;
        
        let mediaItem 
        switch(format) {
          case "wget":
            let splitUrl = child.mediaUrl.split('.');
            let extension = splitUrl[splitUrl.length - 1];
            mediaItem = `wget -O "${child.name}.${extension}" ${child.mediaUrl}<BR>`;
            break;
            
          case "html":
            // html is the default option
          default:
            mediaItem = `<a href="${child.mediaUrl}">${child.name}<\a><BR>`;
            break;
        }
        
        mediaItems.push(mediaItem);
        console.log(mediaItem);
      } else {
        children.push(`<a href="${baseUrl}/?format=${format}&mediaId=${mediaFetcherIndex + ':' + child.id}&heading=${heading} / ${child.name}">${child.name}<\a><BR>\n`);
        console.log(`${child.name}    ${baseUrl}/?format=${format}&mediaId=${mediaFetcherIndex + ':' + child.id}`);
      }
    })

    mediaFetcher.fetchMediaObjectsFrom(mediaStoreId, startingIndex, fetchNextChunk)
  }

  mediaFetcher.fetchMediaObjectsFrom(mediaStoreId, 0, fetchNextChunk)
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})