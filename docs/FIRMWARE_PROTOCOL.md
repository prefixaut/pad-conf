# Firmware Protocol

The protocol to control the Firmware is kept simplistic, to have as few as possible operations to be done on the actual board.
This allows the firmware to be operateable on a multitude of boards, as it keeps it's memory and processing requirements to a minimum.

The procotol acts on a per command basis and answeres with a corresponding success message.
Each command starts with an identifier for which command to execute, the parameters and a line-break to finish the command.
Mutliple parameters are to be separated by a single space.

## Command Overview

* [`a`: All](#all): Get all Panels with their current settings
* [`c`: Count](#count): Get the count/amount of panels of the panel
* [`d`: Debug](#debug): Get or Set the debug mode for the board
* [`g`: Get](#get): Get the settings of a single Panel
* [`l`: Layout](#layout): Get the layout of the Panels
* [`m`: Measure](#mesasure): Get or Set the Measure mode for the board
* [`r`: Reset](#reset): Reset the **saved** settings of the board
* [`s`: Save](#save): Save the currently set settings to persist them
* [`w`: Write](#write): Write settings for a single panel

## Commands

### All

> Usage: `a`

> Response: `a <index,deadzone_start,deadzone_end,char_code [...index,deadzone_start,deadzone_end,char_code]>`

Lists all current settings of the panels. Each panel is separated by space, and the values with a comma.

Example:

```
> a
< a 1,350,390,87 3,290,330,65 5,680,710,68 7,870,920,83
```

### Count

> Usage: `c`

> Response: `c <count>`

Returns the count/amount of the panels.

Example:

```
> c
< c 4
```

### Debug

> Usage: `d [0|1]`

> Response: `d <g|s> <0|1>`

When a value is provided (i.E. `d 0`/`d 1`), then the command acts as a setter and updates the debug state.

Without any value, the command acts as a getter and returns the current debug state.

The response message is `d s` for setters, and `d g` for getters.

As long as debugging is turned on, the controller will post additional messages:

* `d m <... text-messages>`
* `d v <index> <value> <deadzone_start> <deadzone_end> <is_pressed> <was_pressed>`

Example: 

```
> d
< d g 0
> d 1
< d s 1
> d
< d g 1
< d m 1 in range
< d m 1 now pressing
< d v 1 572 350 390 1 0
< d m 1 now releasing
< d v 1 360 350 390 0 1
```

### Get

> Usage: `g <index>`

> Response: `g <index> <deadzone_start> <deadzone_end> <char_code>`

Gets the settings of the requested panel on the index.

Example:

```
> g 1
< g 1 350 390 87
```

### Layout

> Usage: `l`

> Response: `l <number1> <number2> <number3> <number4> <number5> <number6> <number7> <number8> <number9>`

Gets the layout of the Pad in the grid order:

```
1 | 2 | 3
4 | 5 | 6
7 | 8 | 9
```

The value corresponds to the Pin that the controller is reading from (usually not a matter of interest).
When the value is smaller than `0` (Usually only `-1` should be used), then the Panel is not used.
Useful to display the Pad Layout visually.

Example:

```
> l
< l -1 0 -1 1 -1 2 -1 3 -1
```

### Measure

> Usage: `m [0|1]`

> Response: `m <s|g> <0|1>`

When a value is provided (i.E. `m 0`/`m 1`), then the command acts as a setter and updates the measurement state.

Without any value, the command acts as a getter and returns the current measurement state.

The response message is `m s` for setters, and `m g` for getters.

As long as measurement is turned on, the controller will regularily post updates of the values in the following format: `m v <index> <value>`.

Example: 

```
> m
< m g 0
> m 1
< m s 1
> m
< m g 1
< m v 1 572
< m v 2 831
```

### Reset

> Usage: `r`

> Response: `r`

Resets the stored (actually saved, not currently applied!) settings on the board.

Example:

```
> r
< r
```

### Save

> Usage: `s`

> Response: `s`

Saves the currently applied settings onto the local persistent storage.

Example:

```
> s
< s
```

### Write

> Usage: `w <index> <deadzone_start> <deadzone_end> <key_code>`

> Response: `w <index>`

Writes the provided settings for the panel. The settings are only applied and are not persistent!

Example:

```
> w 1 350 390 69
< w 1
```
