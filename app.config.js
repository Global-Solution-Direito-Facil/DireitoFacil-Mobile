/**
 * ---------------------------------------------------------------------------
 * CONFIGURACAO DINAMICA DO EXPO
 * ---------------------------------------------------------------------------
 * Le o app.json e acrescenta o hash do commit, calculado na hora do build.
 * Ninguem copia hash a mao: a tela "Sobre o app" sempre mostra o commit de
 * onde o app foi gerado, e e assim que se confere que o APK entregue e igual
 * ao codigo.
 *
 * Ordem de onde vem o hash:
 *   1. EAS_BUILD_GIT_COMMIT_HASH, que o EAS Build preenche sozinho
 *   2. git rev-parse --short HEAD, no build local
 *   3. "desconhecido", se nao houver git (nunca um hash inventado)
 *
 * Se houver arquivo alterado e ainda nao commitado, o hash ganha o sufixo
 * "-alterado": o build nao corresponde a nenhum commit, e a tela mostra isso.
 * ---------------------------------------------------------------------------
 */
const { execSync } = require('child_process');

function git(comando) {
  try {
    return execSync(`git ${comando}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function hashDoCommit() {
  const doEas = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  if (doEas) return doEas.slice(0, 7);

  const hash = git('rev-parse --short HEAD');
  if (!hash) return 'desconhecido';

  const alterado = git('status --porcelain --untracked-files=no') !== '';
  return alterado ? `${hash}-alterado` : hash;
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    commitHash: hashDoCommit(),
  },
});
