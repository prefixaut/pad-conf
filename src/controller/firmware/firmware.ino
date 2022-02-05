#include <Arduino.h>
#include <EEPROM.h>
#include <Keyboard.h>

#define COMMAND_BUFFER_SIZE 64
#define MAX_PANEL_COUNT 9
#define PIN_UNASSIGNED -1
#define KEY_CODE_UNASSIGNED -1
#define DEBUG_COUNTER_LIMIT 250
#define MEASSURE_COUNTER_LIMIT 50
#define FS_OFFSET 0

/*
 * CONFIGURATION START
 * Your Pad configuration goes here
 */
const int PANEL_COUNT = 4;
const int PAD_LAYOUT[] = {
    PIN_UNASSIGNED,
    0,
    PIN_UNASSIGNED,
    1,
    PIN_UNASSIGNED,
    2,
    PIN_UNASSIGNED,
    3,
    PIN_UNASSIGNED,
};
/* CONFIGURATION END */

class Panel
{
public:
  long deadzone_start;
  long deadzone_end;
  long key_code;

  Panel() : deadzone_start(0), deadzone_end(0), key_code(KEY_CODE_UNASSIGNED) {}
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
void setup()
{
  // Counter to properly offset the memory in the EEPROM
  int read_counter = FS_OFFSET;

  // Read and compare the saved pad-layout
  int layout[MAX_PANEL_COUNT];
  EEPROM.get(read_counter, layout);
  read_counter += sizeof(layout);

  bool same_layout = true;
  for (int i = 0; i < MAX_PANEL_COUNT; i++)
  {
    same_layout &= (PAD_LAYOUT[i] == layout[i]);
  }

  // Load previously saved panels if the layout and panel count is correct
  if (same_layout)
  {
    EEPROM.get(read_counter, panels);
    read_counter += sizeof(panels);
  }

  // USB is always 12 or 480 Mbit/sec
  Serial.begin(9600);
  Keyboard.begin();
}

/**
 * @brief Utility function to print a panel to serial.
 *
 * @param index Index of the panel to be printed
 * @param separator The separator to use between the values
 */
void printPanel(int index, char separator)
{
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
void saveSettings()
{
  // Counter for proper memory offset
  int write_counter = FS_OFFSET;

  // Write the current pad-layout. Used to verify the stored settings, in case a new
  // firmware is loaded, it get's invalidated if the layout doesn't match.
  EEPROM.put(write_counter, PAD_LAYOUT);
  write_counter += sizeof(PAD_LAYOUT);

  // Write the panel settings.
  EEPROM.put(write_counter, panels);
  write_counter += sizeof(panels);
}

/**
 * @brief Utility function to handle all incoming messages and perform the tasks accordingly.
 *
 * @param message The message received from the serial bus.
 */
void handleMessage(char *message)
{
  char *command = strtok(serial_msg_char_buf, " ");

  switch (command[0])
  {

  // Debug
  case 'd':
  {
    char *val = strtok(NULL, " ");

    if (val == NULL)
    {
      Serial.print("d g ");
      Serial.println(enable_debug);
    }
    else
    {
      enable_debug = strcmp(val, "1") == 0;
      debug_counter = 0;
      Serial.print("d s ");
      Serial.println(enable_debug);
    }
    break;
  }

  // Meassure
  case 'm':
  {
    char *val = strtok(NULL, " ");

    if (val == NULL)
    {
      Serial.print("m g ");
      Serial.println(enable_mesassure);
    }
    else
    {
      enable_mesassure = strcmp(val, "1") == 0;
      meassure_counter = 0;
      Serial.print("m s ");
      Serial.println(enable_mesassure);
    }

    break;
  }

  // All
  case 'a':
  {
    Serial.print("a ");
    Serial.print(PANEL_COUNT);
    Serial.print(' ');

    for (int i = 0; i < PANEL_COUNT; i++)
    {
      Serial.print(i);
      Serial.print(',');
      printPanel(i, ',');

      // Not last, so append another space for the next entry
      if ((i + 1) < PANEL_COUNT)
      {
        Serial.print(' ');
      }
    }

    Serial.print('\n');

    break;
  }

  // Count
  case 'c':
  {
    Serial.print("c ");
    Serial.println(PANEL_COUNT);
    break;
  }

  // Layout
  case 'l':
  {
    Serial.print("l ");

    for (int i = 0; i < MAX_PANEL_COUNT; i++)
    {
      Serial.print(PAD_LAYOUT[i]);

      // If not last, separate by space
      if ((i + 1) < MEASSURE_COUNTER_LIMIT)
      {
        Serial.print(' ');
      }
    }

    Serial.print('\n');

    break;
  }

  // Get
  case 'g':
  {
    char *val = strtok(NULL, " ");
    long index = -1;

    if (val != NULL)
    {
      index = strtol(val, NULL, 10);
    }

    if (index < 0 || index >= PANEL_COUNT)
    {
      break;
    }

    Serial.print("g ");
    Serial.print(index);
    Serial.print(' ');
    printPanel(index, ' ');
    Serial.print('\n');

    break;
  }

  // Write
  case 'w':
  {
    char *val = strtok(NULL, " ");
    long index = -1;

    if (val != NULL)
    {
      index = strtol(val, NULL, 10);
    }

    if (index < 0 || index >= PANEL_COUNT)
    {
      break;
    }

    panels[index].deadzone_start = strtol(strtok(NULL, " "), NULL, 10);
    panels[index].deadzone_end = strtol(strtok(NULL, " "), NULL, 10);

    char *key = strtok(NULL, " ");
    if (key != NULL)
    {
      if (strstr(key, "0x") != NULL)
      {
        panels[index].key_code = strtol(key + 2, NULL, 16);
      }
      else
      {
        panels[index].key_code = strtol(key, NULL, 10);
      }
    }

    Serial.print("w ");
    Serial.println(index);

    break;
  }

  // Reset
  case 'r':
  {
    for (int i = 0; i < PANEL_COUNT; i++)
    {
      panels[i] = {};
    }
    saveSettings();
    Serial.println('r');

    break;
  }

  // Save
  case 's':
  {
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
void loop()
{
  int panel_index = 0;
  for (int i = 0; i < MAX_PANEL_COUNT; i++)
  {
    long pin = PAD_LAYOUT[i];
    if (PIN_UNASSIGNED >= pin)
    {
      continue;
    }
    val = analogRead(pin);

    if (val < panels[panel_index].deadzone_start || val > panels[panel_index].deadzone_end)
    {
      if (enable_debug && (debug_counter % DEBUG_COUNTER_LIMIT) == 0)
      {
        Serial.print("d ");
        Serial.print(panel_index);
        Serial.println(" in range");
      }
      if (!already_pressed[panel_index])
      {
        Keyboard.press(panels[panel_index].key_code);
        already_pressed[panel_index] = true;

        if (enable_debug)
        {
          Serial.print("d ");
          Serial.print(panel_index);
          Serial.println(" now pressing");
        }
      }
    }
    else if (already_pressed[panel_index])
    {
      Keyboard.release(panels[panel_index].key_code);
      already_pressed[panel_index] = false;

      if (enable_debug)
      {
        Serial.print("d ");
        Serial.print(panel_index);
        Serial.println(" now releasing");
      }
    }

    if (enable_mesassure && (meassure_counter % MEASSURE_COUNTER_LIMIT) == 0)
    {
      Serial.print("v ");
      Serial.print(panel_index);
      Serial.print(' ');
      Serial.println(val);
    }

    if (enable_debug && (debug_counter % DEBUG_COUNTER_LIMIT) == 0)
    {
      Serial.print("d v ");
      Serial.print(panel_index);
      Serial.print(' ');
      Serial.println(val);
      Serial.print(' ');
      Serial.print(panels[panel_index].deadzone_start);
      Serial.print(' ');
      Serial.print(panels[panel_index].deadzone_end);
      Serial.print(' ');
      Serial.print(val < panels[panel_index].deadzone_start || val > panels[panel_index].deadzone_end);
      Serial.print(' ');
      Serial.println(already_pressed[panel_index]);
    }

    panel_index++;
  }

  if (enable_debug)
  {
    if ((debug_counter % DEBUG_COUNTER_LIMIT) == 0)
    {
      debug_counter = 0;
    }
    debug_counter++;
  }

  if (enable_mesassure)
  {
    if ((meassure_counter % MEASSURE_COUNTER_LIMIT) == 0)
    {
      meassure_counter = 0;
    }
    meassure_counter++;
  }

  // Process Incoming Messages
  while (Serial.available())
  {
    serial_msg = Serial.readStringUntil('\n');
    serial_msg.toCharArray(serial_msg_char_buf, COMMAND_BUFFER_SIZE);
    handleMessage(serial_msg_char_buf);
  }

  // To not accidently overclock the USB cycles.
  delay(1);
}
