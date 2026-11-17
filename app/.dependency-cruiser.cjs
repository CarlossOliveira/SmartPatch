/* Impõe as camadas declaradas em layers.json. Corre com `pnpm architecture`. */
// O dependency-cruiser só lê configuração CommonJS, por isso aqui usa-se require.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const layers = require('./layers.json');

const SRC = 'services/frontend/src';

function higherThan(order, index) {
  return order.slice(index + 1).join('|');
}

const forbidden = [
  {
    name: 'sem-ciclos',
    severity: 'error',
    comment: 'Dois ficheiros nunca se importam um ao outro, direta ou indiretamente.',
    from: {},
    to: { circular: true },
  },
  {
    name: 'ninguem-importa-tooling',
    severity: 'error',
    from: { path: `^${SRC}/` },
    to: { path: '^tooling/' },
  },
  {
    name: 'unidades-nao-se-importam',
    severity: 'error',
    comment: 'Dois componentes irmãos não se importam. O que partilham desce para uma camada de baixo ou chega por argumento.',
    from: { path: `^${SRC}/components/([^/]+)/` },
    to: { path: `^${SRC}/components/`, pathNot: `^${SRC}/components/$1/` },
  },
  {
    name: 'unidade-nao-importa-o-proprio-index',
    severity: 'error',
    from: { path: `^${SRC}/components/([^/]+)/(${layers.unit.join('|')})/` },
    to: { path: `^${SRC}/components/$1/index\\.ts$` },
  },
];

layers.top.forEach((layer, index) => {
  const above = higherThan(layers.top, index);
  if (above !== '') {
    forbidden.push({
      name: `${layer}-nao-importa-acima`,
      severity: 'error',
      from: { path: `^${SRC}/${layer}/` },
      to: { path: `^${SRC}/(${above})/` },
    });
  }
});

layers.unit.forEach((layer, index) => {
  const above = higherThan(layers.unit, index);
  if (above !== '') {
    forbidden.push({
      name: `unidade-${layer}-nao-importa-acima`,
      severity: 'error',
      from: { path: `^${SRC}/components/([^/]+)/${layer}/` },
      to: { path: `^${SRC}/components/$1/(${above})/` },
    });
  }
});

module.exports = {
  forbidden,
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'services/frontend/tsconfig.json' },
  },
};
