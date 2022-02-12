# Pad-Conf

This Project is to setup and calibrate a generic Dance Pad (3x3 Pad) for multiple Games like DDR, PIU, etc.

Requirements:

* A Microcontroller:
  * [Arduino](https://www.arduino.cc/en/Main/Products)
  * [Teensy](https://www.pjrc.com/teensy/)
* Microcontroller Development/Flash Setup:
  * [Arduino IDE 1](https://www.arduino.cc/en/software)
    * [Teensyduino](https://www.pjrc.com/teensy/td_download.html)
  * or [Platform IO](https://platformio.org/) (In progress)

This Repository acts as a mono-repo for all required components of this project.
For detailed information for each component, please refer to the README in the respective directory:

* [Backend](./backend/README.md)
* [Common](./common/README.md)
* [Controller](./controller/README.md)
* [Frontend](./frontend/README.md)

# How to Use

1. [Install this project](#installation)
2. [Setup the Firmware](./docs/FIRMWARE_INSTALL.md#setup-the-firmware)
3. [Flash the Firmware](./docs/FIRMWARE_INSTALL.md#flash-the-firmware)
4. [Start the Backend-Server](#start-the-backend)
5. [Open the Configurator App](https://prefixaut.github.io/pad-conf/)

# Installation

Either clone or [download](https://github.com/prefixaut/pad-conf/archive/refs/heads/master.zip) this repository to your local machine.
If you download this repository, then simply extract it into a folder.

```sh
git clone git@github.com:prefixaut/pad-conf.git
```

Additionally, you may download the latest release of this release from the [Release Page](https://github.com/prefixaut/pad-conf/releases) for your system.

# Start the Backend

Simply execute the downloaded release executable.

# Development

For development, you need to have a compatible [NodeJS runtime](https://nodejs.org/en/) installed.
Then, you only need to install the dependencies via [`npm`](https://www.npmjs.com/) or [`yarn`](https://classic.yarnpkg.com/lang/en/):

```sh
# Install via Yarn
yarn

# Or via NPM
npm ci
```

For easy development, you may start the frontend and backend in the develop mode with hot-reload/auto-restart in two terminals:

```sh
# Start via Yarn
yarn frontend:serve
yarn backend:serve

# Or via NPM
npm run frontend:serve
npm run backend:serve
```