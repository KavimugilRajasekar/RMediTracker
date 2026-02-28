#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN D8
#define RST_PIN D3

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  // Serial.println("Scan RFID Card...");
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Serial.print("UID tag :");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      Serial.print("0");
     }
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();
}