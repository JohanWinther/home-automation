#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <PubSubClient.h>
#include "WIFICredentials.h"

#define LED_BUILTIN 2
#define ONEWIRE D3
OneWire oneWire(ONEWIRE);
DallasTemperature sensors(&oneWire);

// Seconds between updates
const unsigned int wait_in_seconds = 5;

// WiFi and MQTT settings
WiFiClient espClient;
PubSubClient client(espClient);
#define temperature_topic "home/temperature/1"
// Network SSID and password are fetched from WIFICredentials.h

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(ONEWIRE, INPUT);
  Serial.begin(115200);
  delay(10);
  
  // Connect to WiFi
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_ssid);
  WiFi.hostname("Thermometer");
  WiFi.begin(WIFI_ssid, WIFI_password);
  // Blink while connecting
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    digitalWrite(LED_BUILTIN, LOW);
    delay(250);
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  digitalWrite(LED_BUILTIN, LOW);

  client.setServer(mqtt_server, 1883);
  sensors.begin();
}
 
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  sensors.requestTemperatures();
  client.publish(temperature_topic, String(sensors.getTempCByIndex(0)).c_str(), true);
  Serial.println(sensors.getTempCByIndex(0));
  client.loop();
  delay(wait_in_seconds*1000);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection with ");
    Serial.print(mqtt_server);
    Serial.println("...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("Connected to MQTT server!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" - Trying again in 5 seconds...");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}