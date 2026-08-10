#include "config.h"

char inputBuffer[BUFFER_SIZE];
int bufferIndex = 0;
bool isAuthenticated = false;

void setup() {
  Serial.begin(BAUDRATE);
  pinMode(LED_ALERT_PIN, OUTPUT);
  digitalWrite(LED_ALERT_PIN, LOW);

  // Banner fittizio inviato all'avvio / connessione
  Serial.println(F("\n=========================================="));
  Serial.println(F("   SEC-SYS v2.4 IoT Controller (Atmel)   "));
  Serial.println(F("   Type 'HELP' or 'LOGIN user pass'      "));
  Serial.println(F("=========================================="));
  Serial.print(F("SEC-SYS> "));
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n' || c == '\r') {
      if (bufferIndex > 0) {
        inputBuffer[bufferIndex] = '\0';
        processCommand(inputBuffer);
        bufferIndex = 0;
        Serial.print(F("SEC-SYS> "));
      }
    } else {
      if (bufferIndex < BUFFER_SIZE - 1) {
        inputBuffer[bufferIndex++] = c;
      }
    }
  }
}

void sendJsonLog(const char* eventType, const char* payload, bool isSuccess) {
  // Genera una stringa JSON pulita che lo script Python (Forwarder) leggerà
  Serial.print(F("{\"event\":\""));
  Serial.print(eventType);
  Serial.print(F("\",\"data\":\""));
  Serial.print(payload);
  Serial.print(F("\",\"success\":"));
  Serial.print(isSuccess ? "true" : "false");
  Serial.println(F("}"));
}

void processCommand(char* cmd) {
  // Pulizia da spazi iniziali
  while(*cmd == ' ') cmd++;

  if (strncmp(cmd, "LOGIN ", 6) == 0) {
    char user[32] = {0};
    char pass[32] = {0};
    
    // Parsing semplice delle credenziali
    int scanned = sscanf(cmd + 6, "%31s %31s", user, pass);
    
    if (scanned == 2 && strcmp(user, FAKE_ADMIN_USER) == 0 && strcmp(pass, FAKE_ADMIN_PASS) == 0) {
      isAuthenticated = true;
      Serial.println(F("OK: Authentication successful."));
      sendJsonLog("IOT_AUTH_ATTEMPT", cmd + 6, true);
    } else {
      Serial.println(F("ERR: Invalid credentials."));
      // Fai lampeggiare il LED per indicare l'attacco
      digitalWrite(LED_ALERT_PIN, HIGH);
      delay(200);
      digitalWrite(LED_ALERT_PIN, LOW);
      
      sendJsonLog("IOT_AUTH_ATTEMPT", cmd + 6, false);
    }
  } 
  else if (strcmp(cmd, "HELP") == 0) {
    Serial.println(F("Commands: LOGIN <user> <pass>, STATUS, UNLOCK, EXIT"));
    sendJsonLog("IOT_COMMAND_EXEC", "HELP", true);
  } 
  else if (strcmp(cmd, "STATUS") == 0) {
    if (isAuthenticated) {
      Serial.println(F("SYS_STATUS: ARMED | DOORS: LOCKED | SENSORS: ONLINE"));
    } else {
      Serial.println(F("ERR: Unauthorized. Login required."));
    }
    sendJsonLog("IOT_COMMAND_EXEC", "STATUS", isAuthenticated);
  }
  else if (strcmp(cmd, "UNLOCK") == 0) {
    if (isAuthenticated) {
      Serial.println(F("CRITICAL: DOOR UNLOCKED."));
      sendJsonLog("IOT_EXPLOIT_SUCCESS", "DOOR_UNLOCKED", true);
    } else {
      Serial.println(F("ERR: Access Denied. Incident logged."));
      sendJsonLog("IOT_EXPLOIT_FAIL", "DOOR_UNLOCK_UNAUTH", false);
    }
  }
  else {
    Serial.println(F("ERR: Unknown command."));
    sendJsonLog("IOT_INVALID_INPUT", cmd, false);
  }
}