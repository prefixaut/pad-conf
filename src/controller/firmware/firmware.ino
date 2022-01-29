#include <Arduino.h>
#include <EEPROM.h>

#define PANEL_COUNT 4
#define COMMAND_BUFFER_SIZE 64

static_assert(PANEL_COUNT > 0 && PANEL_COUNT < 10, "Panel count has to be between 1 and 9!");

class Panel {
public:
  long pin;
  long base;
  long positive;
  long negative;
  long key_code;

  Panel(): pin(-1), base(512), positive(20), negative(20), key_code(0) {}
};

const bool PAD_LAYOUT[] = {
  false, true, false,
  true, false, true,
  false, true, false,
};
Panel panels[PANEL_COUNT];
bool already_pressed[PANEL_COUNT];

void setup() {
  int read_counter = 0;

  byte saved_count = EEPROM.read(read_counter);
  read_counter += sizeof(saved_count);
  
  bool layout[9];
  EEPROM.get(read_counter, layout);
  read_counter += sizeof(layout);

  bool same_layout = true;
  for (int i = 0; i < 9; i++) {
    same_layout &= (PAD_LAYOUT[i] == layout[i]);
  }

  // Load previously saved panels if the layout and panel count is correct
  if (saved_count == PANEL_COUNT && same_layout) {
    EEPROM.get(read_counter, panels);
    read_counter += sizeof(layout);
  }

  Serial.begin(9600); // USB is always 12 or 480 Mbit/sec
}

int val;
String serial_msg;
char serial_msg_char_buf[COMMAND_BUFFER_SIZE];

bool enable_debug = false;
bool enable_mesassure = false;

int debug_counter = 0;
int meassure_counter = 0;

void printPanel(int index, bool grouped) {
  char separator = grouped ? ',' : ' ';

  Serial.print(panels[index].pin);
  Serial.print(separator);
  Serial.print(panels[index].base);
  Serial.print(separator);
  Serial.print(panels[index].positive);
  Serial.print(separator);
  Serial.print(panels[index].negative);
  Serial.print(separator);
  Serial.print(panels[index].key_code);
}

void saveSettings() {
  // TODO: Save the settings to the EEPROM
}

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

      panels[index].pin = strtol(strtok(NULL, " "), NULL, 10);
      panels[index].base = strtol(strtok(NULL, " "), NULL, 10);
      panels[index].positive = strtol(strtok(NULL, " "), NULL, 10);
      panels[index].negative = strtol(strtok(NULL, " "), NULL, 10);

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

void loop() {
  for (int i = 0; i < PANEL_COUNT; i++) {
    long pin = panels[i].pin;
    if (pin < 0) {
      continue;
    }
    val = analogRead(pin);

    if (val <= panels[i].base - panels[i].negative || val >= panels[i].base + panels[i].positive) {
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
  
  delay(1);
}
