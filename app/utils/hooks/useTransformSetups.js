'use client'

import { useState, useEffect } from "react"

const useTransformSetups = (setupsData) => {
  const [setups, setSetups] = useState([]);
  

  useEffect(() => {
    if (setupsData) {
      const setupOptions = {};
      setupsData.forEach(({ unidad_adm, anexo, entrante, saliente, responsable }) => {
        if (!setupOptions[unidad_adm]) {
          setupOptions[unidad_adm] = {
            unidad_adm,
            entrante,
            saliente,
            responsable,
            anexos: [],
          };
        }
        setupOptions[unidad_adm].anexos.push(anexo);
      });
      
      // Create the final array of setup objects from setupOptions
      setSetups(Object.keys(setupOptions).map(key => setupOptions[key]));
    }
  }, [setupsData]);

  return setups;
};

export default useTransformSetups;
