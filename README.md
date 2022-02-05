# Pad-Conf

This Project is for a generic Dance Pad (3x3 Pad) for multiple Games like DDR, PIU, etc.

Provides a custom firmware as well as a calibration tool to set it up and use it.

Requirements:
* [Teensy](https://www.pjrc.com/teensy/) (v4.0, v4.1)
* Arduino IDE
* [NodeJS](https://nodejs.org) 16 or higher

# How to Use

1. Setup the Firmware
2. Flash the Firmware
3. Start the Configurator

## Setup the Firmware

First, you should setup the firmware and flash it onto your controller.
Open the [firmware-file](src/controller/firmware/firmware.ino) and edit the `PANEL_COUNT` and `PAD_LAYOUT` constants.

`PANEL_COUNT` is the amount of active Panels of your Pad. Examples would be: DDR=4, PIU=5

It represents a 3x3 grid which is designed from left-to-right, top-to-bottom:

```
|1|2|3|
|4|5|6|
|7|8|9|
```

Sample for a DDR Pad:

```
| |1| |
|2| |3|
| |4| |
```

Sample for a PIU Pad:

```
|1| |2|
| |3| |
|4| |5|
```

If a Panel is active, you need to specify which Pin it is connected to on the controller (Note: Usually these start from `0`!).
If a Panel is unsed, simply specify `PIN_UNASSIGNED`.

## Flash the Firmware

# Components

As this project requires three widely different components.

## Server

> Source: `src/server`

The Server is an intermediate hub which handles the connection to the Frontend and the micro-controller.

While the connection to the Frontend is WebSocket based, the connection to the micro-controller is a custom minimal line-based protocol.

## Frontend

> Source: `src/frontent`