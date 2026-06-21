#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <SPI.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include "secrets.h"

constexpr int SS_PIN=5, RST_PIN=27, GREEN_LED_PIN=2, RED_LED_PIN=4, BUZZER_PIN=15, SERVO_PIN=13;
constexpr unsigned long OPEN_TIME_MS=5000;
MFRC522 rfid(SS_PIN,RST_PIN);
LiquidCrystal_I2C lcd(0x27,16,2);
Servo gate;
unsigned long lastScanPollAt=0;
constexpr unsigned long SCAN_POLL_INTERVAL_MS=1500;

void showMessage(const String &a,const String &b=""){
  lcd.clear(); lcd.setCursor(0,0); lcd.print(a.substring(0,16));
  lcd.setCursor(0,1); lcd.print(b.substring(0,16));
}
void setLeds(bool green,bool red){
  digitalWrite(GREEN_LED_PIN,green?HIGH:LOW);
  digitalWrite(RED_LED_PIN,red?HIGH:LOW);
}
void beep(int times,int ms){
  for(int i=0;i<times;i++){digitalWrite(BUZZER_PIN,HIGH);delay(ms);digitalWrite(BUZZER_PIN,LOW);delay(100);}
}
String readUid(){
  String uid;
  for(byte i=0;i<rfid.uid.size;i++){if(rfid.uid.uidByte[i]<0x10)uid+='0';uid+=String(rfid.uid.uidByte[i],HEX);}
  uid.toUpperCase(); return uid;
}
int scanOrder(const String &qrPayload,String &id,String &number,String &store){
  WiFiClientSecure client; client.setInsecure(); HTTPClient http;
  if(!http.begin(client,API_URL))return -1;
  http.addHeader("Content-Type","application/json");
  http.addHeader("X-Device-Key",DEVICE_API_KEY);
  JsonDocument request; request["qrPayload"]=qrPayload;
  String body; serializeJson(request,body);
  int code=http.POST(body); String response=http.getString(); http.end();
  Serial.printf("Validacion HTTP %d: %s\n",code,response.c_str());
  if(code!=HTTP_CODE_OK)return code;
  JsonDocument doc; if(deserializeJson(doc,response))return -2;
  id=doc["order"]["id"]|""; number=doc["order"]["numeroPedido"]|"";
  store=doc["order"]["tiendaRecojo"]|"Tienda Bembos";
  Serial.println("=== PEDIDO ENCONTRADO ===");
  Serial.println("Pedido: #"+number);
  Serial.println("Estado: "+String(doc["order"]["estado"]|"-"));
  Serial.println("Tienda: "+store);
  Serial.printf("Total: S/ %.2f\n",doc["order"]["total"]|0.0);
  for(JsonObject product:doc["order"]["productos"].as<JsonArray>()){
    Serial.printf("%d x %s\n",product["cantidad"]|0,product["nombre"]|"Producto");
  }
  Serial.println("=========================");
  return code;
}
bool confirmPickup(const String &id){
  WiFiClientSecure client; client.setInsecure(); HTTPClient http;
  String url=String(API_BASE_URL)+"/iot/orders/"+id+"/pickup-confirmed";
  if(!http.begin(client,url))return false;
  http.addHeader("Content-Type","application/json");
  http.addHeader("X-Device-Key",DEVICE_API_KEY);
  int code=http.POST("{}"); String response=http.getString(); http.end();
  Serial.printf("Confirmacion HTTP %d: %s\n",code,response.c_str());
  return code==HTTP_CODE_OK;
}
void openGate(){gate.write(90);delay(OPEN_TIME_MS);gate.write(0);}
String fetchQueuedQr(){
  WiFiClientSecure client;client.setInsecure();HTTPClient http;
  String url=String(API_BASE_URL)+"/iot/scans/next";
  if(!http.begin(client,url))return "";
  http.addHeader("X-Device-Key",DEVICE_API_KEY);
  int code=http.GET();
  if(code==204){http.end();return "";}
  String response=http.getString();http.end();
  if(code!=200){Serial.printf("Cola QR HTTP %d: %s\n",code,response.c_str());return "";}
  JsonDocument doc;if(deserializeJson(doc,response))return "";
  return String(doc["qrPayload"]|"");
}
void setup(){
  Serial.begin(115200);Serial.setTimeout(250);
  pinMode(GREEN_LED_PIN,OUTPUT);pinMode(RED_LED_PIN,OUTPUT);pinMode(BUZZER_PIN,OUTPUT);setLeds(false,false);
  gate.setPeriodHertz(50);gate.attach(SERVO_PIN,500,2400);gate.write(0);
  SPI.begin();rfid.PCD_Init();lcd.init();lcd.backlight();showMessage("Conectando","WiFi...");
  WiFi.begin("Wokwi-GUEST","",6);
  while(WiFi.status()!=WL_CONNECTED){delay(250);Serial.print('.');}
  Serial.println("\nWiFi conectado");
  Serial.println("Esperando QR desde el escaner web...");
  showMessage("Esperando QR","Escaner web");
}
void processQr(String qrPayload){
  qrPayload.trim();
  if(!qrPayload.startsWith("BEMBOS_ORDER:")){
    setLeds(false,true);showMessage("QR no valido","Revise el texto");beep(2,100);return;
  }
  Serial.println("QR leido: "+qrPayload);
  showMessage("Validando QR",qrPayload.substring(qrPayload.length()-8));
  String id,number,store;int result=scanOrder(qrPayload,id,number,store);
  if(result==200){
    showMessage("Pedido #"+number,store);setLeds(true,false);beep(1,150);delay(1500);
    if(confirmPickup(id)){
      Serial.println("*** PEDIDO DESPACHADO ***");
      showMessage("Abriendo caja","Retire pedido");openGate();showMessage("Pedido","despachado!");
    }
    else{setLeds(false,true);showMessage("Error al","confirmar");}
  }else if(result==404){setLeds(false,true);showMessage("Codigo","no valido");beep(2,100);}
  else if(result==409){setLeds(false,true);showMessage("Pedido ya","fue recogido");beep(3,100);}
  else if(result==425){setLeds(false,true);showMessage("Pedido aun","no esta listo");beep(2,180);}
  else{setLeds(false,true);showMessage("Error de","conexion/JSON");}
  delay(3000);setLeds(false,false);showMessage("Esperando QR","Escaner web");
  Serial.println("Esperando otro QR desde el escaner web...");
}
void loop(){
  if(millis()-lastScanPollAt>=SCAN_POLL_INTERVAL_MS){
    lastScanPollAt=millis();
    String queuedQr=fetchQueuedQr();
    if(!queuedQr.isEmpty())processQr(queuedQr);
  }
  if(Serial.available()){
    String qrPayload=Serial.readStringUntil(10);
    processQr(qrPayload);
  }
  if(rfid.PICC_IsNewCardPresent()&&rfid.PICC_ReadCardSerial()){
    Serial.println("RFID detectado: "+readUid()+". El QR se ingresa por Serial Monitor.");
    showMessage("RFID no es QR","Use Serial");beep(1,100);
    rfid.PICC_HaltA();rfid.PCD_StopCrypto1();
  }
  delay(20);
}
