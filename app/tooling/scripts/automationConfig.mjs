// Único leitor do automation.config.yml, com esquema estrito.
// Uso: node automationConfig.mjs check
//      node automationConfig.mjs get <caminho.pontilhado>
//      node automationConfig.mjs github <workflow>   (escreve enabled e jobs em $GITHUB_OUTPUT)
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

/** Todas as chaves são obrigatórias. Uma chave desconhecida é erro. */
export const SHAPE = {
  workflows: {
    ci: ['lint', 'architecture', 'test', 'build'],
    security: ['secrets', 'vulnscan'],
    'dependabot-automerge': ['automerge'],
  },
};

export const DEFAULT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../automation.config.yml',
);

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkKeys(value, expected, where) {
  if (!isObject(value)) {
    throw new Error(`${where}: tem de ser um objeto`);
  }
  for (const key of expected) {
    if (!(key in value)) {
      throw new Error(`${where}: falta a chave "${key}"`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!expected.includes(key)) {
      throw new Error(`${where}: chave desconhecida "${key}"`);
    }
  }
}

function checkEnabled(value, where) {
  if (typeof value !== 'boolean') {
    throw new Error(`${where}.enabled: tem de ser true ou false (não "${value}")`);
  }
}

/** Lança um Error com o caminho do problema se a configuração não cumprir o esquema. */
export function validate(config) {
  checkKeys(config, Object.keys(SHAPE), 'config');
  const workflows = config.workflows;
  checkKeys(workflows, Object.keys(SHAPE.workflows), 'workflows');
  for (const [name, jobIds] of Object.entries(SHAPE.workflows)) {
    const where = `workflows.${name}`;
    const workflow = workflows[name];
    checkKeys(workflow, ['enabled', 'jobs'], where);
    checkEnabled(workflow.enabled, where);
    checkKeys(workflow.jobs, jobIds, `${where}.jobs`);
    for (const id of jobIds) {
      const job = workflow.jobs[id];
      checkKeys(job, ['enabled'], `${where}.jobs.${id}`);
      checkEnabled(job.enabled, `${where}.jobs.${id}`);
    }
  }
}

export function loadConfig(file = DEFAULT_FILE) {
  const config = parse(readFileSync(file, 'utf8'));
  validate(config);
  return config;
}

export function getValue(config, dotted) {
  let current = config;
  for (const part of dotted.split('.')) {
    if (!isObject(current) || !(part in current)) {
      throw new Error(`Caminho inexistente: ${dotted}`);
    }
    current = current[part];
  }
  return current;
}

/** Devolve o interruptor do workflow e o mapa { job: boolean } em JSON de uma linha. */
export function githubOutputs(config, workflow) {
  const entry = getValue(config, `workflows.${workflow}`);
  const jobs = {};
  for (const [id, job] of Object.entries(entry.jobs)) {
    jobs[id] = job.enabled;
  }
  return { enabled: String(entry.enabled), jobs: JSON.stringify(jobs) };
}

function main(argv) {
  const [command, argument] = argv;
  const config = loadConfig();
  if (command === 'check') {
    console.log('automation.config.yml válido');
    return;
  }
  if (command === 'get' && argument) {
    console.log(String(getValue(config, argument)));
    return;
  }
  if (command === 'github' && argument) {
    const outputs = githubOutputs(config, argument);
    const lines = `enabled=${outputs.enabled}\njobs=${outputs.jobs}\n`;
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, lines);
    } else {
      process.stdout.write(lines);
    }
    return;
  }
  throw new Error('Uso: automationConfig.mjs check | get <caminho> | github <workflow>');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
}
