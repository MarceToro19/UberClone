# REGLAS DEL PROYECTO: UBERCLONE (VERSIÓN CONDUCTOR)

## 1. PRINCIPIO FUNDAMENTAL (FILTRO DE ALCANCE ESTRICTO)
- **Regla de oro**: NO implementar funcionalidades, pantallas ni dependencias que estén por fuera del documento oficial `UberClone — Versión Conductor.pdf` o que violen los patrones arquitectónicos aprendidos del proyecto de referencia (`C:\Users\Marcela\Documents\ReservaClaseIngles\ReservaClaseIngles`).
- Cualquier solicitud o tentación de agregar módulos adicionales de pasajero, backends complejos no solicitados o librerías pesadas no especificadas queda terminantemente prohibida.
- Ceñirse exactamente a los 8 requerimientos nucleares y pantallas del conductor.

---

## 2. ARQUITECTURA Y ESTILO HEREDADO DE `ReservaClaseIngles`
El proyecto debe seguir la estructura limpia, modular y basada en JavaScript (ES6+), React Native con Expo y React Navigation vista en el proyecto muestra:

```text
UberClone/
├── App.js                         # Proveedores globales (SafeArea, Context, NavigationContainer con tema)
├── app.json                       # Configuración de Expo
├── package.json                   # Dependencias oficiales compatibles con Expo SDK 54 / React 19
├── docs/
│   └── AI_LOG.md                  # Bitácora obligatoria de uso de IA (según Sección 8 del PDF)
├── src/
│   ├── components/                # Componentes reutilizables estilizados con StyleSheet (Card, StatusBadge, Button, etc.)
│   ├── config/
│   │   └── pricing.js             # Tarifas, comisiones y reglas de negocio centralizadas en COP enteros
│   ├── context/                   # Contextos globales (Auth/DriverSession, ActiveTripContext)
│   ├── data/                      # Datos iniciales/mock simulados (mockTrips, vehicleCategories, etc.)
│   ├── hooks/                     # Custom hooks mínimos obligatorios
│   │   ├── useAlmacenamiento.js   # Wrapper limpio de AsyncStorage (preferencias, idioma, disponibilidad)
│   │   ├── useDriverLocation.js   # Manejo de geolocalización continua y limpieza en desmontaje
│   │   ├── useTripRequests.js     # Temporizador de 15s y estado de solicitudes entrantes
│   │   └── useEarnings.js         # Cálculos de ganancias (día, semana, mes) con useMemo
│   ├── navigation/                # Navegación combinada (Stack para viaje, Tabs para registro, Drawer para extras)
│   │   ├── RootNavigator.js
│   │   ├── TripStack.js
│   │   ├── RegisterTabs.js
│   │   └── DriverDrawer.js
│   ├── screens/                   # Pantallas oficiales del conductor
│   │   ├── HomeScreen.js          # Mapa + Switch Disponible/No disponible
│   │   ├── IncomingRequestModal.js # Solicitud con timer de 15s
│   │   ├── ActiveTripScreen.js    # Flujo de ruta recogida -> abordaje -> destino -> fin
│   │   ├── TripSummaryScreen.js   # Cobro, comisiones, ganancia y estado de pago
│   │   ├── EarningsScreen.js      # Resumen día, semana, mes y saldo de conductor
│   │   ├── TripHistoryScreen.js   # FlatList con filtros y detalle modal/pantalla
│   │   ├── ProfileScreen.js       # Perfil, vehículo, documentos, idioma y logout
│   │   └── register/              # Pestañas de registro (Datos personales, Vehículo, Documentos)
│   ├── theme/
│   │   └── index.js               # Tokens de diseño: colors, spacing, radius, typography (heredado del proyecto muestra)
│   └── utils/
│       └── calculateFare.js       # Función pura matemática de cálculo de tarifa y ganancias
```

---

## 3. REGLAS DE NEGOCIO Y MODELO MATEMÁTICO (PDF SECCIONES 2, 3, 5, 6)

### 3.1. Registro del Conductor (3 Pestañas Obligatorias)
- **Pestaña 1 (Personales)**: Foto perfil obligatoria (cámara/galería), Nombre (máx 50 car, solo letras), Documento (6 a 10 dígitos), Celular (10 dígitos), Fecha nacimiento (> 18 años), Género (dropdown), Correo (valida @ y dominio), Idioma (Español/Inglés).
- **Pestaña 2 (Vehículo)**: Categoría (Económico, XL [mínimo 6 pasajeros], Premium), Placa (colombiana ABC123 en mayúsculas), Marca/Modelo (máx 30 car), Año (4 dígitos <= año actual), Color, Foto vehículo visible.
- **Pestaña 3 (Documentos y Pagos)**: Licencia (número + foto, fecha vencimiento futura), SOAT (foto + vencimiento futuro), Técnico-mecánica (foto + vencimiento futuro según año), Correo Mercado Pago, Aceptación de términos con % de comisión visible.
- **Validaciones**: En línea debajo de cada input (NO usar `Alert` para validación de formularios). Botón "Enviar registro" deshabilitado hasta que las 3 pestañas sean 100% válidas.
- **Estado inicial**: `Pendiente de aprobación`. Conductor NO puede ponerse disponible hasta pasar a `Aprobado`.

### 3.2. Ciclo de Vida y Estados del Viaje (`status`)
1. `requested`: Pasajero solicita.
2. `accepted`: Conductor acepta dentro de los 15 segundos.
3. `driver_arriving`: Conductor en camino a recogida.
4. `in_progress`: Pasajero a bordo hacia el destino.
5. `completed`: Finalizado; cálculo de tarifa, comisión y ganancia.
6. `paid`: Confirmado por pasarela o registrado en efectivo.
7. `cancelled`: Cancelado antes de `in_progress`.

### 3.3. Fórmulas de Tarifas y Comisiones (`src/config/pricing.js` y `src/utils/calculateFare.js`)
- **Valores didácticos configurables**:
  - Tarifa base: `$3.500 COP`
  - Valor por km: `$1.200 COP`
  - Valor por minuto: `$250 COP`
  - Tarifa mínima: `$6.000 COP`
  - Multiplicadores: Económico (1.0), XL (1.4), Premium (1.8)
  - Comisión de la plataforma: 20% (0.20)
- **Fórmula**:
  $$\text{Subtotal} = \text{Base} + (\text{km} \times V_{\text{km}}) + (\text{min} \times V_{\text{min}})$$
  $$\text{Tarifa Bruta} = \max(\text{Mínima}, \text{Subtotal} \times M_{\text{categoría}})$$
  - **Redondeo obligatorio**: Tarifa redondeada al múltiplo de 100 COP más cercano antes de calcular comisión.
  $$\text{Comisión} = \text{Tarifa Redondeada} \times 0.20$$
  $$\text{Ganancia Neta} = \text{Tarifa Redondeada} - \text{Comisión} + \text{Propina}$$
- Todos los valores en pesos colombianos enteros (sin decimales erráticos).

### 3.4. Pagos y Saldo del Conductor
- En efectivo: Conductor recibe el dinero completo; la comisión (20%) se descuenta de su saldo interno en la app (el saldo puede quedar negativo).
- Pasarela (Mercado Pago / Stripe test): Se acredita la ganancia neta.
- **Saldo**: Ganancias de pasarela menos comisiones de efectivo.

---

## 4. REGLAS TÉCNICAS Y BUENAS PRÁCTICAS DE HOOKS
- **`useState`**: Estado local de disponibilidad, formularios y timers.
- **`useEffect`**: Obligatorio con función de retorno (limpieza) para pausar GPS al ponerse no disponible o desmontar la pantalla, y limpiar timers.
- **`useMemo`**: Obligatorio para calcular totales de ganancias (día, semana, mes) y filtros del historial.
- **`useCallback`**: Manejadores de aceptar/rechazar viajes y callbacks pesados.
- **`useContext`**: Manejo de sesión de conductor y viaje activo.
- **`AsyncStorage`**: Únicamente para sesión no sensible y preferencias (idioma, disponibilidad). NUNCA tarjetas, credenciales ni tokens sensibles.

---

## 5. REGLAS DE BITÁCORA DE IA (`docs/AI_LOG.md`)
- Obligatorio documentar cada asistencia de IA en `docs/AI_LOG.md` con la plantilla oficial especificada en la sección 8 del PDF.
- Cada bloque relevante generado con IA debe contener en el código la referencia:
  `// AI-assisted: see docs/AI_LOG.md #X`

---

## 6. POLÍTICA DE COMMITS FRECUENTES Y PUNTOS DE GUARDADO
- **Regla estricta de granularidad**: No acumular múltiples funcionalidades en una sola sesión de trabajo. 
- Cada hito o funcionalidad atómica completada (ej. estructura base, registro pestaña por pestaña, función matemática de tarifas, hooks de ubicación, etc.) debe cerrarse inmediatamente con:
  1. Actualización de la bitácora `docs/AI_LOG.md`.
  2. Notificación y recordatorio al usuario para que él ejecute manualmente el commit.
  3. **EL ASISTENTE NUNCA EJECUTA `git commit` DIRECTAMENTE**: Solo debe proporcionar el comando exacto y sugerir el mensaje convencional (`feat: ...`, `chore: ...`, `fix: ...`).


