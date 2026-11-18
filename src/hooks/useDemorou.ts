/**
 * `true` quando algo esta ativo ha mais de `ms`. Serve para explicar a espera:
 * a API Java no Render gratuito dorme quando fica parada e leva ate 1 minuto
 * para acordar; e a leitura da receita pela IA tambem demora alguns segundos.
 * Por isso o texto nao afirma a causa.
 */
import { useEffect, useState } from 'react';

export const MENSAGEM_DEMORA =
  'Está demorando um pouco. Se o servidor estava parado, pode levar até 1 minuto. Não feche o app.';

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
