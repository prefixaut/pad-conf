#include <Arduino.h>

#define PIN_RIGHT = 0;
#define PIN_UP = 1;
#define PIN_LEFT = 2;
#define PIN_DOWN = 3;

long base[] = {740, 200, 70, 0};
long threshPos[] = {70, 40, 40, 40};
long threshNeg[] = {70, 2000, 2000, 2000};
bool pressedArrow[] = {false, false, false, false};
int keyList[] = {KEY_RIGHT, KEY_UP, KEY_LEFT, KEY_DOWN};

void setup() {
    Serial.begin(9600); // USB is always 12 or 480 Mbit/sec
}

void setValue(char *valueType, long index, long value) {
  if (strcmp(valueType, "B") == 0) {
    base[index] = value;
  } else if (strcmp(valueType, "P") == 0) {
    threshPos[index] = value;
  } else {
   threshNeg[index] = value;
  }
}

void readValue(char *valueType, long index) {
  if (strcmp(valueType, "B") == 0) {
    Serial.println(base[index]);
  } else if (strcmp(valueType, "P") == 0) {
    Serial.println(threshPos[index]);
  } else {
    Serial.println(threshNeg[index]);
  }
}

int val;
String serialMsg;
char serialMsgCharBuf[50];
bool enableDebug = false;
int debugCounter = 0;
void loop() {
  for (int i = 0; i < 4; i++) {
    val = analogRead(i);
    if (val <= base[i] - threshNeg[i] || val >= base[i] + threshPos[i]) {
      if (!pressedArrow[i]) {
        Keyboard.press(keyList[i]);
        pressedArrow[i] = true;
      }
    } else if (pressedArrow[i]) {
      Keyboard.release(keyList[i]);
      pressedArrow[i] = false;
    }

    if (enableDebug && debugCounter % 250) {
      Serial.print(i);
      Serial.print(" ");
      Serial.println(val);
    }
  }

  if (enableDebug) {
    if (debugCounter % 250) {
      debugCounter = 0;
    }
    debugCounter++;
  }

  if (Serial.available()) {
    serialMsg = Serial.readStringUntil('\n');
    serialMsg.toCharArray(serialMsgCharBuf, 50);
    char *comm = strtok(serialMsgCharBuf, " ");
    if (strcmp(comm, "D") == 0) {
      enableDebug = !enableDebug;
      delay(1);
      return;
    }
    char *valueType = strtok(NULL, " ");
    char *e;
    long index = strtol(strtok(NULL, " "), &e, 10);

    if (strcmp(comm, "S") == 0) {
      long value = strtol(strtok(NULL, " "), &e, 10);
      setValue(valueType, index, value);
    } else {
      readValue(valueType, index);
    }
  }
  
  delay(1);
}
