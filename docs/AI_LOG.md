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
