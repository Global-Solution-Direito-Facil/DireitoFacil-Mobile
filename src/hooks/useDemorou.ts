/**
 * `true` quando algo esta ativo ha mais de `ms`. Serve para trocar o
 * "Carregando..." por uma explicacao: a API Java no Render gratuito dorme
 * quando fica parada e leva ate 1 minuto para acordar.
 */
import { useEffect, useState } from 'react';

export const MENSAGEM_ACORDANDO =
  'Acordando o servidor, isso pode levar até 1 minuto. Não feche o app.';

export function useDemorou(ativo: boolean, ms = 6000): boolean {
  const [demorou, setDemorou] = useState(false);

  useEffect(() => {
    if (!ativo) return;
    const relogio = setTimeout(() => setDemorou(true), ms);
    return () => {
      clearTimeout(relogio);
      setDemorou(false);
    };
  }, [ativo, ms]);

  return ativo && demorou;
}
