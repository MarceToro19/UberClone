// AI-assisted: see docs/AI_LOG.md #1
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook reutilizable de AsyncStorage con limpieza en desmontaje y manejo de errores.
 * Patrón heredado de ReservaClaseIngles/src/hooks/useAlmacenamiento.js
 */
export default function useAlmacenamiento(clave, valorInicial) {
  const [valor, setValor] = useState(valorInicial);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let activo = true;

    AsyncStorage.getItem(clave)
      .then((almacenado) => {
        if (activo && almacenado !== null) {
          try {
            setValor(JSON.parse(almacenado));
          } catch (e) {
            setValor(almacenado);
          }
        }
      })
      .catch((error) => console.log('Error leyendo ' + clave, error))
      .finally(() => activo && setListo(true));

    return () => {
      activo = false;
    };
  }, [clave]);

  const actualizar = useCallback(
    async (nuevoValor) => {
      try {
        setValor(nuevoValor);
        await AsyncStorage.setItem(clave, JSON.stringify(nuevoValor));
      } catch (error) {
        console.log('Error guardando ' + clave, error);
      }
    },
    [clave]
  );

  const eliminar = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(clave);
      setValor(valorInicial);
    } catch (error) {
      console.log('Error eliminando ' + clave, error);
    }
  }, [clave, valorInicial]);

  return [valor, actualizar, listo, eliminar];
}
