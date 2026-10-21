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


