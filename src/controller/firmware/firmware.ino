#include <Arduino.h>
#include <EEPROM.h>

#define PANEL_COUNT 4
#define COMMAND_BUFFER_SIZE 64
#define PIN_UNASSIGNED -1
#define KEY_CODE_UNASSIGNED -1

static_assert(PANEL_COUNT > 0 && PANEL_COUNT < 10, "Panel count has to be between 1 and 9!");

/*
 * Your Pad configuration goes here
 */
const bool PAD_LAYOUT[] = {
  false, true, false,
  true, false, true,
  false, true, false,
};
const int PIN_LAYOUT[] = {
  PIN_UNASSIGNED, 0, PIN_UNASSIGNED,
  1, PIN_UNASSIGNED, 2,
  PIN_UNASSIGNED, 3, PIN_UNASSIGNED,
}

class Panel {
public:
  long pin;
  long deadzone_start;
  long deadzone_end;
  long key_code;

  Panel(): pin(PIN_UNASSIGNED), deadzone_start(0), deadzone_end(0), key_code(KEY_CODE_UNASSIGNED) {}
};

/*
 * State-Variables of the controller
 */
Panel panels[PANEL_COUNT];
bool already_pressed[PANEL_COUNT];

int val;
String serial_msg;
char serial_msg_char_buf[COMMAND_BUFFER_SIZE];

bool enable_debug = false;
bool enable_mesassure = false;

int debug_counter = 0;
int meassure_counter = 0;

/**
 * @brief Setup-Function when the controller boots up.
 * As soon as the controller starts, this function is invoked to perform
 * a complete setup to make this device operable.
 */
void setup() {
  // Counter to properly offset the memory in the EEPROM
  int read_counter = 0;

  // Read and compare the saved panel count
  byte saved_count = EEPROM.read(read_counter);
  read_counter += sizeof(saved_count);
  
  // Read and compare the saved pad-layout
  bool layout[9];
  EEPROM.get(read_counter, layout);
  read_counter += sizeof(layout);

  bool same_layout = true;
  for (int i = 0; i < 9; i++) {
    same_layout &= (PAD_LAYOUT[i] == layout[i]);
  }

  // Read and compare the saved pin-layout
  int pins[9];
  EEPROM.get(read_counter, pins);
  read_counter += sizeof(pins);

  bool same_pins = true;
  for (int i = 0; i < 9; i++) {
    same_pins &= (PIN_LAYOUT[i] == pins[i]);
  }

  // Load previously saved panels if the layout and panel count is correct
  if (saved_count == PANEL_COUNT && same_layout && same_pins) {
    EEPROM.get(read_counter, panels);
    read_counter += sizeof(layout);
  }

  // USB is always 12 or 480 Mbit/sec
  Serial.begin(9600);
}

/**
 * @brief Utility function to print a panel to serial.
 * 
 * @param index Index of the panel to be printed
 * @param grouped If this is part of a grouped message or not
 */
void printPanel(int index, bool grouped) {
  char separator = grouped ? ',' : ' ';

  Serial.print(panels[index].deadzone_start);
  Serial.print(separator);
  Serial.print(panels[index].deadzone_end);
  Serial.print(separator);
  Serial.print(panels[index].key_code);
}

/**
 * @brief Utility function to save the current state of the panels to the EEPROM.
 * 
 */
void saveSettings() {
  // TODO: Save the settings to the EEPROM
}

/**
 * @brief Utility function to handle all incoming messages and perform the tasks accordingly.
 * 
 * @param message The message received from the serial bus.
 */
void handleMessage(char *message) {
  char *command = strtok(serial_msg_char_buf, " ");

  switch (command[0]) {

    // Debug
    case 'd': {
      char *val = strtok(NULL, " ");

      if (val == NULL) {
        Serial.print("d ");
        Serial.println(enable_debug);
      } else if (strcmp(val, "0") != enable_debug) {
        enable_debug = !enable_debug;
        debug_counter = 0;
        Serial.print("d ");
        Serial.println(enable_debug);
      }
      break;
    }

    // Meassure
    case 'm': {
      char *val = strtok(NULL, " ");

      if (val == NULL) {
        Serial.print("m ");
        Serial.println(enable_mesassure);
      } else if (strcmp(val, "0") != enable_mesassure) {
        enable_mesassure = !enable_mesassure;
        meassure_counter = 0;
        Serial.print("m ");
        Serial.println(enable_mesassure);
      }

      break;
    }

    // All
    case 'a': {
      Serial.print("a ");
      Serial.print(PANEL_COUNT);
      Serial.print(' ');

      for (int i = 0; i < PANEL_COUNT; i++) {
        Serial.print(i);
        Serial.print(':');
        printPanel(i, true);
        if (i != 3) {
          Serial.print(' ');
        }
      }

      Serial.print('\n');

      break;
    }

    // Count
    case 'c': {
      Serial.print("c ");
      Serial.println(PANEL_COUNT);
      break;
    }

    // Layout
    case 'l': {
      Serial.print("l ");

      for (int i = 0; i < 9; i++) {
        Serial.print(PAD_LAYOUT[i]);
      }

      Serial.print('\n');

      break;
    }

    // Get
    case 'g': {
      char *val = strtok(NULL, " ");
      long index = -1;

      if (val != NULL) {
        index = strtol(val, NULL, 10);
      }

      if (index < 0 || index >= PANEL_COUNT) {
        break;
      }

      Serial.print("g ");
      Serial.print(index);
      Serial.print(' ');
      printPanel(index, false);
      Serial.print('\n');

      break;
    }

    // Write
    case 'w': {
      char *val = strtok(NULL, " ");
      long index = -1;

      if (val != NULL) {
        index = strtol(val, NULL, 10);
      }

      if (index < 0 || index >= PANEL_COUNT) {
        break;
      }

      panels[index].deadzone_start = strtol(strtok(NULL, " "), NULL, 10);
      panels[index].deadzone_end = strtol(strtok(NULL, " "), NULL, 10);

      char *key = strtok(NULL, " ");
      if (key != NULL) {
        if (strstr(key, "0x") != NULL) {
          panels[index].key_code = strtol(key + 2, NULL, 16);
        } else {
          panels[index].key_code = strtol(key, NULL, 10);
        }
      }

      Serial.print("w ");
      Serial.println(index);

      break;
    }

    // Reset
    case 'r': {
      for (int i = 0; i < PANEL_COUNT; i++) {
        panels[i] = {};
      }
      saveSettings();
      Serial.println('r');

      break;
    }

    // Save
    case 's': {
      saveSettings();
      Serial.println('s');

      break;
    }
  }
}

/**
 * @brief The controller loop which is executed continously.
 * As soon as this function completes, the general teensy environment
 * does it's job and executes this function again.
 */
void loop() {
  for (int i = 0; i < PIN_LAYOUT; i++) {
    long pin = PIN_LAYOUT[i];
    if (pin < 0) {
      continue;
    }
    val = analogRead(pin);

    if (val < panels[i].deadzone_start && val > panels[i].deadzone_end) {
      if (!already_pressed[i]) {
        Keyboard.press(panels[i].key_code);
        already_pressed[i] = true;
      }
    } else if (already_pressed[i]) {
      Keyboard.release(panels[i].key_code);
      already_pressed[i] = false;
    }

    if (enable_mesassure && meassure_counter % 250) {
      Serial.print('v');
      Serial.print(' ');
      Serial.print(i);
      Serial.print(' ');
      Serial.println(val);
    }
  }

  if (enable_debug) {
    if (debug_counter % 250) {
      debug_counter = 0;
    }
    debug_counter++;
  }

  if (enable_mesassure) {
    if (meassure_counter % 250) {
      meassure_counter = 0;
    }
    meassure_counter++;
  }

  // Process Incoming Messages
  while (Serial.available()) {
    serial_msg = Serial.readStringUntil('\n');
    serial_msg.toCharArray(serial_msg_char_buf, COMMAND_BUFFER_SIZE);
    handleMessage(serial_msg_char_buf);
  }
  
  // To not accidently overclock the USB cycles.
  delay(1);
}
