# ESP32 - Kiosco de recojo Bembos

Simulacion Wokwi con ESP32, RFID RC522, LCD I2C, LEDs, buzzer y servo.

La tarjeta RFID actua como disparador fisico. El pedido se identifica con el texto QR configurado en `ORDER_QR_PAYLOAD`, porque el UID corto de una tarjeta no equivale al token QR de 48 caracteres de la app.

## Configuracion

1. Copia `secrets.example.h` como `secrets.h`.
2. Configura `DEVICE_API_KEY` con el mismo `IOT_DEVICE_API_KEY` de Railway.
3. Crea un pedido en la app y copia el texto completo del QR en `ORDER_QR_PAYLOAD`.
4. Cambia el pedido a `Listo para recoger` antes de probar el kiosco.
5. Despliega la version actualizada de `orders-service` y abre esta carpeta en Wokwi.
6. Inicia la simulacion y pulsa la tarjeta del lector RC522.

## Respuestas

- `200`: abre la compuerta y cambia el pedido a `Entregado`.
- `404`: QR inexistente.
- `409`: pedido ya recogido.
- `425`: pedido aun no listo.
