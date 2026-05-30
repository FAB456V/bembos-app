# Bembos App - Prototipo de Optimización Móvil

Prototipo universitario de una app móvil de Bembos con arquitectura de microservicios, autenticación JWT, pedidos y seguimiento de delivery en tiempo real con Socket.io.

## Arquitectura

| Servicio | Puerto local | Responsabilidad | Base MongoDB |
| --- | ---: | --- | --- |
| `api-gateway` | `3000` | Entrada HTTP y WebSocket del frontend | No usa BD |
| `auth-service` | `3001` | Registro, login y perfil JWT | `bembos_auth` |
| `orders-service` | `3002` | Creación e historial de pedidos | `bembos_orders` |
| `tracking-service` | `3003` | Ubicación y estado en tiempo real | `bembos_tracking` |
| `notification-service` | `3004` | Registro y envío Expo Push | `bembos_notifications` |

El frontend usa Expo SDK 51, React Native, Expo Router, Axios, AsyncStorage, Socket.io Client y `react-native-maps`.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Docker y Docker Compose para ejecutar el backend localmente.
- Cuenta gratuita de MongoDB Atlas.
- Expo Go o un emulador Android para probar la app móvil.

## 1. Crear las bases en MongoDB Atlas

1. Crea un proyecto y un cluster en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. En `Database Access`, crea un usuario con contraseña.
3. En `Network Access`, autoriza tu IP para desarrollo. Para Railway puedes autorizar `0.0.0.0/0` y usar credenciales robustas.
4. Copia la cadena `mongodb+srv://...` del cluster.
5. Usa una base distinta en cada URI:

```text
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/bembos_auth
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/bembos_orders
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/bembos_tracking
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/bembos_notifications
```

MongoDB crea las colecciones al insertar el primer documento. No necesitas crear tablas manualmente.

## 2. Configurar el backend local

Desde la raíz del proyecto:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` y reemplaza las cuatro URI de Atlas. Genera secretos distintos con:

```bash
openssl rand -hex 32
```

Usa un resultado para `JWT_SECRET` y otro para `SERVICE_API_KEY`.

Levanta los cinco servicios:

```bash
docker compose up --build
```

Comprueba el gateway:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{"service":"api-gateway","status":"ok"}
```

## 3. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npx expo-doctor --verbose
npm start
```

Para web o el simulador iOS puedes mantener `localhost`. En el emulador Android estándar usa `10.0.2.2`. En un teléfono físico reemplaza `localhost` en `frontend/.env` por la IP LAN de tu computadora, por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
EXPO_PUBLIC_TRACKING_URL=http://192.168.1.20:3000
```

Abre la app con Expo Go, registra un usuario, agrega productos al carrito y confirma un pedido. El catálogo es local porque el alcance no incluye un microservicio de productos.

## 4. Simular el movimiento del delivery

El evento `delivery:update` está protegido por `SERVICE_API_KEY`. Para una demostración local, crea temporalmente un script Node con `socket.io-client` o ejecútalo desde una terminal que tenga esa dependencia disponible:

```js
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: { serviceKey: process.env.SERVICE_API_KEY },
  transports: ['websocket'],
});

socket.on('connect', () => {
  socket.emit('delivery:update', {
    orderId: 'REEMPLAZAR_ID_DEL_PEDIDO',
    deliveryId: 'delivery-demo-01',
    lat: -12.0464,
    lng: -77.0428,
    status: 'En camino',
  }, console.log);
});
```

Estados aceptados:

```text
En preparacion
En camino
Entregado
```

## 5. Desplegar en Railway

Usa un repositorio Git remoto y crea un proyecto en [Railway](https://railway.com/). Railway debe desplegar cinco servicios independientes desde el mismo repositorio.

### Orden recomendado

1. Despliega `auth-service`, `orders-service` y `notification-service`.
2. Genera un dominio público para esos tres servicios.
3. Despliega `tracking-service` usando las URLs públicas de pedidos y notificaciones.
4. Genera un dominio público para tracking.
5. Despliega `api-gateway` usando las cuatro URLs públicas.
6. Genera el dominio público final del gateway.

### Crear cada servicio

Para cada microservicio:

1. Selecciona `New Service` y conecta el repositorio.
2. Configura `Root Directory` con la carpeta correspondiente, por ejemplo `backend/auth-service`.
3. Railway detectará el `Dockerfile` dentro de esa carpeta.
4. Agrega las variables desde [backend/railway-env.example](backend/railway-env.example).
5. No definas `PORT`: Railway lo inyecta automáticamente.
6. En `Networking`, genera un dominio público.

Las carpetas raíz son:

```text
backend/auth-service
backend/orders-service
backend/notification-service
backend/tracking-service
backend/api-gateway
```

`JWT_SECRET` debe ser igual en auth, pedidos y tracking. `SERVICE_API_KEY` debe ser igual en pedidos, tracking y notificaciones.

### Conectar el frontend al gateway Railway

Edita `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://TU-API-GATEWAY.up.railway.app
EXPO_PUBLIC_TRACKING_URL=https://TU-API-GATEWAY.up.railway.app
```

Socket.io también usa el dominio del gateway porque este reenvía el tráfico WebSocket hacia tracking.

## 6. Expo Push

`notification-service` siempre registra la notificación en MongoDB. El envío push ocurre si la solicitud interna incluye un `expoPushToken` válido.

Para usar push con control de acceso de Expo, configura `EXPO_ACCESS_TOKEN` en Railway. Para el prototipo puede quedar vacío mientras no se envíen pushes reales.

## 7. Validaciones útiles

Backend:

```bash
cd backend
docker compose --env-file .env.example config --quiet
docker compose build
```

Frontend:

```bash
cd frontend
npx expo-doctor --verbose
npx expo export --platform web --output-dir /tmp/bembos-web
npx expo export --platform android --output-dir /tmp/bembos-android
```

## Seguridad del prototipo

- Las contraseñas se almacenan con bcrypt.
- Los endpoints del cliente usan JWT.
- Las operaciones internas usan `SERVICE_API_KEY`.
- Tracking valida que el pedido pertenece al usuario antes de permitir la suscripción Socket.io o devolver la ubicación.
- Los documentos de ubicaciones expiran automáticamente después de siete días mediante un índice TTL.
- Los archivos `.env` están excluidos de Git.
