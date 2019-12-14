# CONNETO

CONNETO는 NVIDIA의 Gamstream Protocol을 구현한 [Moonlight for Chrome](http://moonlight-stream.com)에 기반한 Chrome app입니다.
CONNETO는 powerful desktop에서 실행할 수 있는 고사양의 게임들을 laptop에서 원격으로 매우 낮은 딜레이로 즐길 수 있게 해줍니다.
사용을 위해서는 [WEB interface](https://github.com/twice154/react_server)가 필요합니다.

## Features

* Streams Steam Big Picture and all of your games from your PC to your Chrome browser
* Keyboard and mouse support
* Hardware-accelerated video decoding
* Full support for Xbox controllers and PlayStation controllers, and some other HID gamepads
* Use mDNS to scan for compatible GeForce Experience (GFE) machines on the network

## Installation
Server:
* Download [GeForce Experience](http://www.geforce.com/geforce-experience) and install on your GameStream-compatible PC

Client:
1. Install the Chrome Native Client SDK and download the current Pepper SDK
2. Set the `NACL_SDK_ROOT` environment variable to your Pepper SDK folder. If you need more detailed instructions, see [here](https://github.com/google/pepper.js/wiki/Getting-Started)
3. Run `git submodule update --init --recursive` from within `moonlight-chrome/`
4. Run `make` from within the `moonlight-chrome/` repo

## Requirements
Server: 
* [GameStream-compatible](http://shield.nvidia.com/play-pc-games/) computer with GTX 600+ series desktop or mobile GPU (for the PC from which you're streaming)

Client: 
- Chrome browser on Windows, Mac OS X, Linux, or Chrome OS

Both Sides: 
* High-end wireless router (802.11n dual-band recommended) or wired network

## Testing
1. Open the Extensions page in Chrome
2. Check the 'Developer mode' option
3. Click 'Load unpacked extension' and point it at your built moonlight-chrome repo
4. Run Moonlight from the extensions page
5. If making changes, make sure to click the Reload button on the Extensions page

