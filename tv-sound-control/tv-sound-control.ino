#include <Servo.h>

Servo motor;
unsigned short int motorPin = 9;
unsigned short int tvPin = 2;
unsigned short int tv;
unsigned short int tvPrev;
short int motorOffsetAngle = 30;
short int motorDefaultAngle = 90;

void setup() {
  pinMode(tvPin, INPUT);
  motor.attach(motorPin);
  tvPrev = tv = digitalRead(tvPin);
}

void loop() {
  tv = digitalRead(tvPin);
  if (tv != tvPrev) pushButton();
  tvPrev = tv;
}

void pushButton() {
  motor.write(motorDefaultAngle+motorOffsetAngle);
  delay(200);
  motor.write(motorDefaultAngle);
  delay(200);
}