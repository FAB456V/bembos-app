# Kiosco QR Bembos

## Páginas

- `http://localhost:4173/scanner`: cámara o archivo QR, una lectura por vez y comprobante de entrega.
- `http://localhost:4173/dashboard`: pedidos pendientes y entregados. Los pedidos en `En preparacion` pueden cambiarse a `Listo para recoger`.
- `http://localhost:4173/`: portada con acceso a ambas páginas.

## Ejecución

```bash
npm start
```

La clave `IOT_DEVICE_API_KEY` se guarda solo en el almacenamiento local del navegador. Al marcar un pedido como listo, el backend envía una notificación Expo si ese pedido fue creado por una versión de la app que registró `expoPushToken`. Los pedidos antiguos cambian de estado, pero no pueden recibir push porque no tienen token asociado.
