const int buttonPin = 2;
const int ledPin_01 = 13;
const int ledPin_02 = 12;
boolean buttonState;
const unsigned long period_01 = 3000;        // relapsed time necessary for first LED to turn on
const unsigned long period_02 = 6000;        // relapsed time necessary for second LED to turn on
unsigned long startMillis;                // time at which button was pressed
unsigned long currentMillis;              // current time
void setup(){
pinMode(ledPin_01, OUTPUT);
  pinMode(ledPin_02, OUTPUT);
  pinMode(buttonPin, INPUT);
  Serial.begin(9600);
}
void loop(){
if(buttonState == LOW){
     buttonState = digitalRead(buttonPin);  // check if button is pressed
     if(buttonState == HIGH){               //
        startMillis = millis();
        }
   }
        
  Serial.println(buttonState);            // print button state
  Serial.println(startMillis);            // print time at which button was pressed
  
  currentMillis = millis();               // current time
  Serial.println(currentMillis);
if((currentMillis - startMillis > period_01) && (buttonState == HIGH)){ // trigger first LED
  Serial.println("condition met");
  digitalWrite(ledPin_01, HIGH);
  } else {
    Serial.println("condition not met");
    digitalWrite(ledPin_01, LOW);
    }
if((currentMillis - startMillis > period_02) && (buttonState == HIGH)){ // trigger second LED
  Serial.println("condition met");
  digitalWrite(ledPin_02, HIGH);
  } else {
    Serial.println("condition not met");
    digitalWrite(ledPin_02, LOW);
    }
}