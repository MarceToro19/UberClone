# Bitácora de Uso de IA — UberClone (Versión Conductor)

Esta bitácora registra cada interacción relevante con herramientas de Inteligencia Artificial para el desarrollo de la aplicación móvil, cumpliendo con la Sección 8 del documento oficial de requisitos.

---

### Entrada #1
- **Fecha**: 2026-10-18
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Inicializar la línea base arquitectónica del proyecto respetando las reglas de `UberClone — Versión Conductor.pdf` y los patrones del proyecto `ReservaClaseIngles`.
- **Prompt**: "necesito crear un nuevo proyecto en el cual las reglas de negocio y su estructra dependen del archivo @[UberClone — Versión Conductor.pdf] , necesito crearlo teniendo rpesente la estrcutura librerias y conceptos implementados en el proyecto que esta ne la ruta C:\Users\Marcela\Documents\ReservaClaseIngles, necesito crear un archivo de reglas para que no olvides este parametro ya que no debo tratar de no implementar funcionabilidades que estan fuera del proyecto muestra; es muy importante para este proyecto ir dejando comits de funcionabilidades que se van desarrollando por favor tambien genera un recordatorio para yo generando estos puntos de guardado y no extendernos, agrega esto como regla y continuemos con la crear de la linea base del proyecto y generar el primer commit"
- **Resumen de la respuesta**: Se extrajeron las especificaciones exactas del PDF (8 funciones principales, fórmulas de tarifas en COP, registro en 3 pestañas, ciclo de estados y hooks obligatorios), se inspeccionó el proyecto de referencia `ReservaClaseIngles` para adoptar sus tokens de tema y convenciones, y se crearon los archivos de configuración base (`AGENTS.md`, `package.json`, `app.json`, `src/theme/index.js`, `src/config/pricing.js`, `src/utils/calculateFare.js`, `src/hooks/useAlmacenamiento.js`, `App.js`).
- **Qué se usó / modificó / descartó**: Se utilizó la estructura modular de `ReservaClaseIngles` (colors, spacing, radius, typography, hooks con bandera `activo`). Se descartaron dependencias pesadas innecesarias y cualquier vista ajena al rol de conductor.
- **Archivos y commit**: `AGENTS.md`, `CLAUDE.md`, `package.json`, `app.json`, `.gitignore`, `App.js`, `src/theme/index.js`, `src/config/pricing.js`, `src/utils/calculateFare.js`, `src/hooks/useAlmacenamiento.js` — *Primer commit de línea base*.
- **Verificación**: Probado matemáticamente el cálculo de tarifas con el ejemplo de la Sección 5 (8.5 km, 22 min, XL = $26.900 COP tarifa bruta, $5.380 COP comisión del 20%, $21.520 COP ganancia neta).
- **Aprendizaje**: Centralizar todas las constantes de negocio y multiplicadores de categorías en `src/config/pricing.js` previene inconsistencias entre el cálculo de solicitudes y el cierre de viajes.

---

### Entrada #2
- **Fecha**: 2026-10-20
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Desarrollar la Parte 1 del Módulo 2 (Registro del Conductor): componentes reutilizables de formulario, validadores en línea de las 3 pestañas (personales, vehículo, documentos) y contexto global de sesión `DriverSessionContext`.
- **Prompt**: "pasemos al modulo 2 registro del conductor , creemos esta logica y si es necesario las vistas, recuerda que si es extenso esta implemntacion realicemosla en dos partes para ir creadno lso commits"
- **Resumen de la respuesta**: Se modularizó la implementación en dos fases atómicas. En esta primera fase se implementaron los componentes base de formulario visual sin alertas (`FormField`, `OptionSelector`, `PhotoPickerField`), el motor puro de validación (`registerValidators.js`) con las reglas estrictas del PDF (mayor de 18 años, placa colombiana ABC123, capacidad mín 6 en XL, SOAT/Licencia vigentes y comisión del 20%) y el contexto `DriverSessionContext` con soporte de persistencia y simulación del estado `Pendiente de aprobación` / `Aprobado`.
- **Qué se usó / modificó / descartó**: Se utilizaron los tokens de estilo y el hook `useAlmacenamiento`. Se descartaron validaciones intrusivas mediante `Alert` (estrictamente prohibidas por el documento oficial).
- **Archivos y commit**: `src/components/FormComponents.js`, `src/utils/registerValidators.js`, `src/context/DriverSessionContext.js`, `docs/AI_LOG.md` — *Commit Parte 1 Módulo 2*.
- **Verificación**: Pruebas automáticas exitosas en consola de validación positiva y captura estricta de errores esperados (menor de edad y capacidad XL menor a 6).
- **Aprendizaje**: Separar las funciones puras de validación de los componentes de UI permite reutilizar las reglas tanto en tiempo real en los inputs como al evaluar la habilitación global del botón final.

---

### Entrada #3
- **Fecha**: 2026-10-20
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Desarrollar la Parte 2 del Módulo 2 (Pantallas de Registro por Pestañas y Estado de Aprobación): `PersonalTabScreen`, `VehicleTabScreen`, `DocumentsTabScreen`, contenedor `RegisterTabsScreen` y `PendingApprovalScreen`.
- **Prompt**: "listo puedes continuar [con la parte 2 del modulo 2]"
- **Resumen de la respuesta**: Se construyeron las 3 pantallas de cada pestaña y el contenedor con barra de progreso y botón "Enviar registro" reactivo a la validez del 100% de los campos. Además, se construyó la pantalla oficial de estado `Pendiente de aprobación` con bloqueo del botón de disponibilidad y switch de simulación de base de datos requerido por la Sección 2.
- **Qué se usó / modificó / descartó**: Se conectaron los validadores puros desarrollados en la Entrada #2 con el estado del `DriverSessionContext`. Se compiló y verificó con Metro Bundler (`npx expo export --platform web`).
- **Archivos y commit**: `src/screens/register/PersonalTabScreen.js`, `src/screens/register/VehicleTabScreen.js`, `src/screens/register/DocumentsTabScreen.js`, `src/screens/register/RegisterTabsScreen.js`, `src/screens/register/PendingApprovalScreen.js`, `App.js`, `docs/AI_LOG.md` — *Commit Parte 2 Módulo 2*.
- **Verificación**: Metro Bundler compiló 303 módulos exitosamente sin errores de sintaxis ni de layout.
- **Aprendizaje**: La validación continua con `useMemo` sobre cada pestaña permite brindar retroalimentación en tiempo real en los iconos de las pestañas (cambiando a check verde cuando la sección está completa) sin bloquear la navegación del usuario.

---

### Entrada #4
- **Fecha**: 2026-10-20
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Desarrollar el Módulo 3.1 y 7 (Pantalla Principal, Mapa, Switch Disponible/No disponible y hook obligatorio `useDriverLocation` con limpieza en desmontaje).
- **Prompt**: "puedes continuar [con el modulo 3]"
- **Resumen de la respuesta**: Se creó el hook `useDriverLocation` que activa el seguimiento continuo cuando el conductor pasa a `Disponible` y lo detiene inmediatamente en la función de limpieza de `useEffect` al desconectarse o desmontar la vista. Se implementó el componente visual `DriverMapView` con marcador rotativo de telemetría y la pantalla `HomeScreen` con botón switch interactivo de conexión, barra de saldo y categoría de vehículo.
- **Qué se usó / modificó / descartó**: Se implementó una solución de telemetría continua ligera compatible con Web/Móvil con intervalo de refresco cada 4 segundos, respetando la recomendación de consumo de la Sección 7 para no agotar cuotas de Google Maps.
- **Archivos y commit**: `src/hooks/useDriverLocation.js`, `src/components/DriverMapView.js`, `src/screens/HomeScreen.js`, `App.js`, `docs/AI_LOG.md` — *Commit Módulo 3*.
- **Verificación**: Metro Bundler compiló 306 módulos exitosamente con código de salida 0 (`The command exited with code 0`).
- **Aprendizaje**: La función de retorno de `useEffect` (`return () => clearInterval / clearWatch`) es crítica en React Native para evitar fugas de memoria y gasto de batería cuando el conductor pasa a estado inactivo.

---

### Entrada #5
- **Fecha**: 2026-10-29
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Desarrollar el Módulo 3.2 (Solicitudes Entrantes de Viaje): hook `useTripRequests` con temporizador estricto de 15 segundos, auto-rechazo, contexto `ActiveTripContext` y modal interactivo `IncomingRequestModal`.
- **Prompt**: "procedamos con le siguiente paso"
- **Resumen de la respuesta**: Se creó el conjunto de datos de prueba simulados con cálculo de tarifa en COP ([mockTripRequests.js](file:///c:/Users/Marcela/Documents/UberClone/src/data/mockTripRequests.js)), el hook obligatorio [useTripRequests.js](file:///c:/Users/Marcela/Documents/UberClone/src/hooks/useTripRequests.js) con temporizador regresivo de 15s y limpieza en desmontaje/rechazo, el contexto global [ActiveTripContext.js](file:///c:/Users/Marcela/Documents/UberClone/src/context/ActiveTripContext.js) para orquestar los estados del viaje y el modal oficial [IncomingRequestModal.js](file:///c:/Users/Marcela/Documents/UberClone/src/screens/IncomingRequestModal.js) con ganancia neta en COP, detalle de tarifa, datos del pasajero, recorrido e indicador de tiempo crítico. Se integró todo reactivamente en [HomeScreen.js](file:///c:/Users/Marcela/Documents/UberClone/src/screens/HomeScreen.js) y [App.js](file:///c:/Users/Marcela/Documents/UberClone/App.js).
- **Qué se usó / modificó / descartó**: Se reutilizó `calculateTripFare` para desglosar la ganancia neta y comisión del 20% en tiempo real. Se descartaron librerías de alertas externas, resolviendo todo con un modal nativo y temporizador React puro.
- **Archivos y commit**: `src/data/mockTripRequests.js`, `src/hooks/useTripRequests.js`, `src/context/ActiveTripContext.js`, `src/screens/IncomingRequestModal.js`, `src/screens/HomeScreen.js`, `App.js`, `docs/AI_LOG.md` — *Commit Módulo 3.2 (Solicitudes Entrantes)*.
- **Verificación**: Metro Bundler compiló 316 módulos exitosamente con código de salida 0 (`The command exited with code 0`).
- **Aprendizaje**: La sincronización entre el temporizador de cuenta regresiva (15s) y la condición de `isAvailable` requiere limpiar y resetear las referencias `setInterval` inmediatamente en los callbacks de aceptación/rechazo para evitar condiciones de carrera o rechazos involuntarios.

---

### Entrada #6
- **Fecha**: 2026-10-29
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Desarrollar el Módulo 4 y 5.1 (Pantalla de Viaje Activo y Pantalla de Resumen/Cobro): ciclo de estados del viaje (`accepted` -> `driver_arriving` -> `in_progress` -> `completed`), cronómetro continuo, restricción de cancelaciones y cálculo de cobro en efectivo vs pasarela con impacto en el saldo del conductor.
- **Prompt**: "pasemos al sigueinte modulo"
- **Resumen de la respuesta**: Se creó la pantalla [ActiveTripScreen.js](file:///c:/Users/Marcela/Documents/UberClone/src/screens/ActiveTripScreen.js) con barra de progreso de 4 pasos, cronómetro en vivo, botón dinámico de cambio de estado y restricción de cancelación que impide cancelar una vez el pasajero esté a bordo (`in_progress`). Se creó la pantalla [TripSummaryScreen.js](file:///c:/Users/Marcela/Documents/UberClone/src/screens/TripSummaryScreen.js) con el desglose exacto de la tarifa redondeada en COP, cálculo de la comisión del 20% y actualización del saldo: en efectivo se descuenta la comisión del saldo interno, mientras que en pasarela se acredita la ganancia neta. Se integró la navegación reactiva en [App.js](file:///c:/Users/Marcela/Documents/UberClone/App.js).
- **Qué se usó / modificó / descartó**: Se utilizó la paleta y componentes de `src/theme`, cronómetro con `useEffect` e integración con `ActiveTripContext` y `DriverSessionContext`.
- **Archivos y commit**: `src/screens/ActiveTripScreen.js`, `src/screens/TripSummaryScreen.js`, `App.js`, `docs/AI_LOG.md` — *Commit Módulo 4 y 5.1 (Viaje Activo y Resumen de Cobro)*.
- **Verificación**: Metro Bundler compiló 319 módulos exitosamente con código de salida 0 (`The command exited with code 0`).
- **Aprendizaje**: La distinción entre cobro en efectivo (donde la app descuenta comisión de la billetera virtual) y pasarela (donde se acredita ganancia neta) debe reflejarse transparentemente en la UI de resumen para evitar confusiones al conductor antes de volver a ponerse disponible.

---

### Entrada #7
- **Fecha**: 2026-10-29
- **Integrante**: Marcela
- **Herramienta**: Antigravity / Gemini
- **Objetivo**: Integrar la credencial oficial de Google Maps Platform (Sección 7 del documento de requisitos), aprovechando el crédito mensual gratuito de $200 USD para carga de mapa web con estilo oscuro (Dark Mode) y marcador SVG reactivo.
- **Prompt**: "credencial que geneor el portal es esta y veo qu elos servicios ya estan habilitados: AIzaSyAUbzCSiEGOV9j7Hs7le2s5w5x2SUeW4tY"
- **Resumen de la respuesta**: Se creó el archivo de configuración centralizada [mapsConfig.js](file:///c:/Users/Marcela/Documents/UberClone/src/config/mapsConfig.js) con la clave de API y la paleta de estilo oscuro nocturna (Dark Theme Uber). Se actualizó [app.json](file:///c:/Users/Marcela/Documents/UberClone/app.json) con la configuración de Google Maps para Android e iOS. Se actualizó el componente visual [DriverMapView.js](file:///c:/Users/Marcela/Documents/UberClone/src/components/DriverMapView.js) para inyectar dinámicamente la librería de Google Maps JavaScript API en web, centrar el mapa en la ubicación del conductor y rotar el marcador según la orientación de telemetría.
- **Qué se usó / modificó / descartó**: Se utilizó `google.maps.Map` con carga dinámica asíncrona sin bloquear la UI ni depender de librerías nativas conflictivas en web. Se conservó el renderizado de respaldo y telemetría flotante para asegurar estabilidad total.
- **Archivos y commit**: `src/config/mapsConfig.js`, `app.json`, `src/components/DriverMapView.js`, `docs/AI_LOG.md` — *Commit Integración Google Maps Platform*.
- **Verificación**: Metro Bundler empaquetó 320 módulos con código de salida 0 sin ningún error (`The command exited with code 0`).
- **Aprendizaje**: Cargar Google Maps JavaScript API de manera asíncrona con script dinámico en entornos web de React Native/Expo permite utilizar la API oficial sin perder compatibilidad ni requerir paquetes pesados adicionales.
