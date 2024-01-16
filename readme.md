A very simple Node.js HTTP server which proxies DLNA content over HTTP. This tool allow content from DLNA servers to be accessed from a web browser.

The server exposes a web interface that allows DLNA servers and their content to be browsed. The web page is ***very*** plain and simple; just html, no images and no css.

DLNA servers make their content available by HTTP; the primary purpose of this tool is to allow these HTTP urls to be easily accessed.

It was specifically created to download recordings from a set top DVR box.


# Installation and Launch

To run the proxy:
- Install [Node.js](https://nodejs.org/en).
- Download the contents of this repository.
- Install the dependencies using `npm install`
- Start the server using `npm start`

The server listens on port 3000 and is normally accessed via [http://localhost:3000](http://localhost:3000)

The home page uses SSDP to discover UPNP servers on the local network.

Clicking a server link opens a page which lists the DLNA content hosted by that server.

By default media items are presented as links.

Alternatively, clicking the *wget* link (below the page's title) shows the shell commands that may be used to download the content using `wget`.


# Tested DLNA Servers

The proxy has been tested with Chrome and these DLNA hosts:
- Mini DLNA (Raspberry Pi)
- Synology NAS
- Panasonic DMR PWT520

The server does NOT currently work with:
- MythTv; it gets stuck in a loop and repeatedly downloads the same set of links.
- Jellyfin; it assumes that folder images are media items and does NOT allow the folder's content to be viewed.

Neither of these issues would be particularly difficult to fix, but I have not yet had the time nor inclination to do so.


# Gotchas

SSDP discovery is done once on start up; if a DLNA host is not listed then restart the server to refresh the list.



