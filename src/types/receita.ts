/** Receita e Farmacia Popular. A tabela do programa decide; a IA so le a receita. */

export type Medicamento = {
  nome: string;
  principioAtivo: string;
  dosagem: string;
};

export type ResultadoMedicamento = Medicamento & {
  gratuito: boolean;
  observacao: string;
};
