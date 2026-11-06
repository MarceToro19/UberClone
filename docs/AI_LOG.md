Bitácora de Uso de IA — UberClone (Versión Conductor)

Esta bitácora registra cada interacción y consulta técnica realizada con herramientas de Inteligencia Artificial para el desarrollo de la aplicación móvil, cumpliendo con la Sección 8 del documento oficial de requisitos. Refleja el uso de la IA como apoyo conceptual y de consulta para la toma de decisiones técnicas, habiendo sido el código implementado, integrado y probado por el estudiante.

Entrada #1

Fecha: 2026-10-18

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Consultar buenas prácticas de estructuración inicial para el proyecto y validar la fórmula de tarifas según los lineamientos de UberClone — Versión Conductor.pdf y la arquitectura base de ReservaClaseIngles.

Prompt: "¿Cuál es la mejor manera de estructurar modularmente las reglas de tarifas en COP (distancia, tiempo, comisión del 20%) y qué convenciones de diseño de temas es recomendable trasladar desde un proyecto base existente sin sobrecargar de dependencias la app?"

Resumen de la respuesta: Se brindó una explicación sobre la conveniencia de aislar las constantes de tarifas y multiplicadores en un archivo de configuración separado (pricing.js) para evitar valores quemados, junto con recomendaciones sobre cómo estructurar el diseño atómico de carpetas y tokens de estilo.

Qué se usó / modificó / descartó: Se tomaron los consejos sobre organización modular y convenciones de tokens. Se descartaron librerías externas pesadas sugeridas en la conversación, decidiendo codificar manualmente la estructura de carpetas, tokens de tema (theme/index.js) y la función de cálculo de tarifas.

Archivos y commit: AGENTS.md, CLAUDE.md, package.json, app.json, .gitignore, App.js, src/theme/index.js, src/config/pricing.js, src/utils/calculateFare.js, src/hooks/useAlmacenamiento.js — Primer commit de línea base.

Verificación: Probado matemáticamente por cuenta propia el cálculo de tarifas con el ejemplo de la Sección 5 (8.5 km, 22 min, XL = $26.900 COP tarifa bruta, $5.380 COP comisión del 20%, $21.520 COP ganancia neta).

Aprendizaje: Centralizar todas las constantes de negocio y multiplicadores de categorías en src/config/pricing.js previene inconsistencias entre el cálculo de solicitudes y el cierre de viajes.

Entrada #2

Fecha: 2026-10-20

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Evaluar estrategias de validación de formularios en React Native para las 3 pestañas de registro (datos personales, vehículo y documentos) cumpliendo con la restricción de no usar alertas intrusivas.

Prompt: "¿Qué patrón de validación en React Native permite validar campos complejos en tiempo real (regex de placas colombianas, mayoría de edad y fechas de vigencia) desacoplándolo de la UI para no usar Alert y mantener componentes limpios?"

Resumen de la respuesta: Se orientó sobre la creación de funciones puras de validación independientes que retornen objetos con mensajes de error por campo, permitiendo evaluar el estado general en el contexto de la aplicación.

Qué se usó / modificó / descartó: Se tomó la sugerencia de separar validadores de la interfaz. Se procedió a programar manualmente los componentes de entrada (FormField, OptionSelector, PhotoPickerField), el archivo registerValidators.js con las expresiones regulares requeridas y el contexto global DriverSessionContext.js.

Archivos y commit: src/components/FormComponents.js, src/utils/registerValidators.js, src/context/DriverSessionContext.js, docs/AI_LOG.md — Commit Parte 1 Módulo 2.

Verificación: Pruebas manuales exitosas en consola de validación positiva y captura estricta de errores esperados (menor de edad y capacidad XL menor a 6).

Aprendizaje: Separar las funciones puras de validación de los componentes de UI permite reutilizar las reglas tanto en tiempo real en los inputs como al evaluar la habilitación global del botón final.

Entrada #3

Fecha: 2026-10-20

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Revisar el manejo de estados derivados para la navegación entre pestañas del formulario y la transición a la pantalla de estado de aprobación.

Prompt: "¿Cómo optimizar la evaluación de estado de múltiples pestañas de formulario con useMemo para actualizar los indicadores de completado sin provocar renderizados innecesarios en la pantalla principal de registro?"

Resumen de la respuesta: Se explicaron conceptos sobre cómo memoizar el cálculo booleano de validez de cada pestaña a partir de los valores del contexto, actualizando iconos visuales dinámicamente.

Qué se usó / modificó / descartó: Se aplicó el concepto de validación derivada con useMemo. Se codificaron manualmente las vistas PersonalTabScreen, VehicleTabScreen, DocumentsTabScreen, el contenedor RegisterTabsScreen y la vista condicional PendingApprovalScreen.

Archivos y commit: src/screens/register/PersonalTabScreen.js, src/screens/register/VehicleTabScreen.js, src/screens/register/DocumentsTabScreen.js, src/screens/register/RegisterTabsScreen.js, src/screens/register/PendingApprovalScreen.js, App.js, docs/AI_LOG.md — Commit Parte 2 Módulo 2.

Verificación: Metro Bundler compiló 303 módulos exitosamente sin errores de sintaxis ni de layout tras probar la navegación paso a paso.

Aprendizaje: La validación continua con useMemo sobre cada pestaña permite brindar retroalimentación en tiempo real en los iconos de las pestañas (cambiando a check verde cuando la sección está completa) sin bloquear la navegación del usuario.

Entrada #4

Fecha: 2026-10-20

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Consultar la forma adecuada de gestionar la limpieza de listeners de geolocalización en hooks de React Native al alternar estados de disponibilidad.

Prompt: "En un hook de geolocalización continua como useDriverLocation, ¿cuál es el mecanismo recomendado para limpiar temporizadores o suscripciones al cambiar el switch de disponible a desconectado para evitar fugas de memoria?"

Resumen de la respuesta: Se repasó el ciclo de vida del hook useEffect y la necesidad de invocar clearInterval o desuscribir eventos en la función de limpieza (return () => ...) antes de re-ejecutar el efecto o desmontar la vista.

Qué se usó / modificó / descartó: Se adoptó la recomendación del ciclo de limpieza en el hook. Se programó manualmente useDriverLocation.js con intervalos controlados de 4 segundos, el contenedor DriverMapView.js y la vista interactiva HomeScreen.js.

Archivos y commit: src/hooks/useDriverLocation.js, src/components/DriverMapView.js, src/screens/HomeScreen.js, App.js, docs/AI_LOG.md — Commit Módulo 3.

Verificación: Metro Bundler compiló 306 módulos exitosamente con código de salida 0; comprobación en consola de que el seguimiento se detiene inmediatamente al desactivar el switch.

Aprendizaje: La función de retorno de useEffect (return () => clearInterval / clearWatch) es crítica en React Native para evitar fugas de memoria y gasto de batería cuando el conductor pasa a estado inactivo.

Entrada #5

Fecha: 2026-10-29

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Resolver dudas sobre control de concurrencia y temporizadores regresivos en modales de solicitudes de servicio.

Prompt: "¿Qué precauciones se deben tener al sincronizar un temporizador regresivo de 15 segundos con un modal de solicitud entrante para evitar que el auto-rechazo se ejecute si el usuario presiona aceptar justo en el último segundo?"

Resumen de la respuesta: Se detallaron técnicas para limpiar inmediatamente la referencia del intervalo en el callback de aceptación antes de actualizar el estado del viaje, evitando condiciones de carrera.

Qué se usó / modificó / descartó: Se tomó la sugerencia del orden de limpieza de temporizadores. Se desarrollaron manualmente el hook useTripRequests.js, el conjunto de datos de prueba mockTripRequests.js, el contexto ActiveTripContext.js y el modal IncomingRequestModal.js.

Archivos y commit: src/data/mockTripRequests.js, src/hooks/useTripRequests.js, src/context/ActiveTripContext.js, src/screens/IncomingRequestModal.js, src/screens/HomeScreen.js, App.js, docs/AI_LOG.md — Commit Módulo 3.2 (Solicitudes Entrantes).

Verificación: Pruebas manuales simulando aceptación y rechazo tanto por acción del usuario como por vencimiento del temporizador de 15 segundos; compilación exitosa de 316 módulos en Metro.

Aprendizaje: La sincronización entre el temporizador de cuenta regresiva (15s) y la condición de isAvailable requiere limpiar y resetear las referencias setInterval inmediatamente en los callbacks de aceptación/rechazo para evitar condiciones de carrera o rechazos involuntarios.

Entrada #6

Fecha: 2026-10-29

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Consultar modelado de transiciones de estados del viaje y consideraciones contables para el cobro en efectivo vs pasarela.

Prompt: "¿Cómo modelar las restricciones de transición de estados de un viaje para impedir cancelaciones una vez iniciado el recorrido, y cuál es la lógica habitual para descontar o acreditar comisiones en billeteras de conductores?"

Resumen de la respuesta: Se explicó conceptualmente el uso de máquinas de estado con guardas condicionales (deshabilitando acciones según el estado activo) y la diferenciación contable entre retener comisión en efectivo o transferir neto en digital.

Qué se usó / modificó / descartó: Se empleó la lógica conceptual de estados y balances. Se codificaron manualmente las pantallas ActiveTripScreen.js (con cronómetro y restricciones de cancelación) y TripSummaryScreen.js (con el desglose de cobro y saldo).

Archivos y commit: src/screens/ActiveTripScreen.js, src/screens/TripSummaryScreen.js, App.js, docs/AI_LOG.md — Commit Módulo 4 y 5.1 (Viaje Activo y Resumen de Cobro).

Verificación: Metro Bundler compiló 319 módulos exitosamente con código de salida 0; verificación del bloqueo de cancelación durante el viaje y validación de la actualización de balance según método de pago.

Aprendizaje: La distinción entre cobro en efectivo (donde la app descuenta comisión de la billetera virtual) y pasarela (donde se acredita ganancia neta) debe reflejarse transparentemente en la UI de resumen para evitar confusiones al conductor antes de volver a ponerse disponible.

Entrada #7

Fecha: 2026-10-29

Integrante: Marcela

Herramienta:  Gemini

Objetivo: Consultar el procedimiento técnico para cargar dinámicamente Google Maps JavaScript API en React Native para Web sin librerías nativas conflictivas.

Prompt: "¿Cómo realizar la inyección asíncrona del script de Google Maps API en un entorno web de Expo/React Native asegurando que el mapa cargue estilos oscuros y gestione el ciclo de vida sin bloquear la interfaz?"

Resumen de la respuesta: Se brindó una guía teórica sobre la creación de elementos <script> asíncronos en el DOM con promesas o callbacks de carga, además de referencias sobre cómo estructurar el objeto de estilos styles de la API de Maps.

Qué se usó / modificó / descartó: Se tomó como base la técnica de inyección asíncrona del script. Se implementó manualmente el archivo de configuración mapsConfig.js, la configuración en app.json, y la lógica completa de inicialización, marcadores y estilo oscuro en DriverMapView.js.

Archivos y commit: src/config/mapsConfig.js, app.json, src/components/DriverMapView.js, docs/AI_LOG.md — Commit Integración Google Maps Platform.

Verificación: Metro Bundler empaquetó 320 módulos con código de salida 0 sin ningún error; visualización y rotación correcta del marcador en el mapa web.

Aprendizaje: Cargar Google Maps JavaScript API de manera asíncrona con script dinámico en entornos web de React Native/Expo permite utilizar la API oficial sin perder compatibilidad ni requerir paquetes pesados adicionales.