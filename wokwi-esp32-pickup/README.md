# ESP32 - Kiosco de recojo Bembos

Simulacion Wokwi con ESP32, RFID RC522, LCD I2C, LEDs, buzzer, servo y sensor DHT22 para monitorear la temperatura de la caja de recojo.

La pagina `qr-scanner` lee el QR con la camara o desde una imagen y lo envia a Railway. El ESP32 consulta automaticamente la cola cada 1.5 segundos. El Serial Monitor se conserva como entrada alternativa.

## Configuracion

1. Copia `secrets.example.h` como `secrets.h`.
2. Configura `DEVICE_API_KEY` con el mismo `IOT_DEVICE_API_KEY` de Railway.
3. Ejecuta `npm start` dentro de `qr-scanner` y abre `http://localhost:4173`.
4. Cambia el pedido a `Listo para recoger` antes de probar el kiosco.
5. Despliega la version actualizada de `orders-service` y abre esta carpeta en Wokwi.
6. Inicia la simulacion y escanea el QR con la pagina web; Wokwi lo recibira automaticamente.
7. Ajusta el DHT22 en Wokwi si quieres simular otra temperatura de caja. El rango aceptado en el sketch es de 35 C a 60 C.

## Respuestas

- `200`: abre la compuerta y cambia el pedido a `Entregado`.
- `404`: QR inexistente.
- `409`: pedido ya recogido.
- `425`: pedido aun no listo.
