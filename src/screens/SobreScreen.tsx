/**
 * Sobre o app. Mostra o hash do commit do build publicado: e assim que se
 * confere que o app no Firebase App Distribution e igual ao codigo.
 */
import Constants from 'expo-constants';
import { Image, StyleSheet, View } from 'react-native';

import { Cartao } from '../components/Cartao';
import { LinhaInfo } from '../components/LinhaInfo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { config } from '../config/env';
import { espaco } from '../lib/tema';

/** Integrantes do grupo, turma 2TDSPG. */
const EQUIPE = [
  { nome: 'Alexander Dennis Isidro Mamani', rm: 'RM565554' },
  { nome: 'Gabriel Neris Losano', rm: 'RM564093' },
  { nome: 'João Vítor Biribilli Ravelli', rm: 'RM565594' },
  { nome: 'Kelson Zhang', rm: 'RM563748' },
  { nome: 'Pietro Paranhos Wilhelm', rm: 'RM561378' },
];

export function SobreScreen() {
  return (
    <Tela>
      <View style={e.topo}>
        <Image source={require('../../assets/images/logo.png')} style={e.logo} accessible={false} />
        <Texto variante="h1" centro>
          Direito Fácil
        </Texto>
        <Texto cor="textoFraco" centro>
          Famílias de pessoas com autismo, com deficiência e idosos de baixa renda descobrem e
          acompanham seus direitos a partir do laudo médico. A regra oficial decide; a IA explica.
        </Texto>
      </View>

      <Cartao>
        <Texto variante="h3">Versão</Texto>
        <LinhaInfo rotulo="Versão do app" valor={Constants.expoConfig?.version ?? '—'} />
        <LinhaInfo rotulo="Commit" valor={config.commit} />
        <LinhaInfo rotulo="Dados" valor={config.usarMock ? 'Demonstração' : 'APIs Java e .NET'} />
      </Cartao>

      <Cartao>
        <Texto variante="h3">Equipe · 2TDSPG</Texto>
        {EQUIPE.map((p) => (
          <LinhaInfo key={p.rm} rotulo={p.nome} valor={p.rm} />
        ))}
      </Cartao>

      <Texto variante="pequeno" cor="textoFraco" centro>
        Global Solution FIAP 2026/2 · CitizenTech · ODS 3, 10 e 11. Todos os dados de demonstração
        são fictícios.
      </Texto>
    </Tela>
  );
}

const e = StyleSheet.create({
  topo: { alignItems: 'center', gap: espaco.sm },
  logo: { width: 80, height: 80 },
});
