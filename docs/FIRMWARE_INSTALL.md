# Firmware Installation/Setup

The custom firmware for your arduino/teensy is required to make it possible to properly interact with your board from the outside.

## Setup the Firmware

First, you should setup the firmware to flash it onto your controller.
Open the [firmware-file](/controller/src/firmware/firmware.ino) and edit the `PANEL_COUNT` and `PAD_LAYOUT` constants.

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

Flashing is sadly a bit cumbersome for non-developers, as you need to setup either the Arduino IDE (+ Teensyduino if you're using a teensy-board),
or get Platform-IO up and running for this project.

### Arduino IDE (v1)

1. Install the [Arduino IDE 1](https://www.arduino.cc/en/software)
   * If you"re using a teensy-board, also install [Teensyduino](https://www.pjrc.com/teensy/td_download.html)
2. Open the [firmware](/controller/src/firmware/firmware.ino) in the Arduino IDE
3. Try compiling the Firmware (As changes from the [Setup the Firmware](#setup-the-firmware) might break it) by clicking the checkmark in the top left
4. Make sure your board is connected
5. Go to `Tools > Ports` and select the Port to your board (On Windows it's **NOT** COM1)
6. Go to `Tools > Board` and select the correct Board-Type (If it isn't already)
7. Go to `Tools > USB Type` and select `Serial + Keyboard + Mouse + Joystick`
8. Last but not least, click the arrow which is pointing to the right in the top left corner (Next to the checkmark from step 3)

### Platform IO

The Platform IO setup is not complete

1. Install [Platform IO](https://platformio.org/)
