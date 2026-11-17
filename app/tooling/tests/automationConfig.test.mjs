import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { SHAPE, githubOutputs, loadConfig, validate } from '../scripts/automationConfig.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const workflowsDir = path.join(repoRoot, '.github/workflows');

function validConfig() {
  return structuredClone(loadConfig());
}

describe('esquema do automation.config.yml', () => {
  it('aceita o ficheiro real', () => {
    assert.doesNotThrow(() => loadConfig());
  });

  it('rejeita uma chave desconhecida', () => {
    const config = validConfig();
    config.workflows.ci.jobs.extra = { enabled: true };
    assert.throws(() => validate(config), /chave desconhecida "extra"/);
  });

  it('rejeita uma chave em falta', () => {
    const config = validConfig();
    delete config.workflows.security.jobs.vulnscan;
    assert.throws(() => validate(config), /falta a chave "vulnscan"/);
  });

  it('rejeita um enabled que não seja booleano a sério', () => {
    const config = validConfig();
    config.workflows.ci.jobs.lint.enabled = 'yes';
    assert.throws(() => validate(config), /true ou false/);
  });

  it('rejeita um bloco de topo desconhecido', () => {
    const config = validConfig();
    config.hooks = {};
    assert.throws(() => validate(config), /chave desconhecida "hooks"/);
  });

  it('devolve o mapa de jobs em JSON de uma linha', () => {
    const outputs = githubOutputs(validConfig(), 'security');
    assert.equal(outputs.enabled, 'true');
    assert.deepEqual(JSON.parse(outputs.jobs), { secrets: true, vulnscan: true });
  });
});

describe('workflows contra o automation.config.yml', () => {
  const files = readdirSync(workflowsDir).filter((name) => name.endsWith('.yml'));

  it('tem um ficheiro por workflow declarado', () => {
    const names = files.map((name) => name.replace(/\.yml$/, '')).sort();
    assert.deepEqual(names, Object.keys(SHAPE.workflows).sort());
  });

  for (const file of files) {
    const name = file.replace(/\.yml$/, '');
    const workflow = parse(readFileSync(path.join(workflowsDir, file), 'utf8'));
    const expected = SHAPE.workflows[name];

    it(`${name}: os jobs são exatamente os do YAML mais "config"`, () => {
      assert.deepEqual(Object.keys(workflow.jobs).sort(), [...expected, 'config'].sort());
    });

    it(`${name}: todos os jobs dependem de config e respeitam o seu interruptor`, () => {
      for (const id of expected) {
        const job = workflow.jobs[id];
        const needs = [job.needs].flat();
        assert.ok(needs.includes('config'), `${name}.${id} tem de ter needs: config`);
        assert.ok(job.if.includes("needs.config.outputs.enabled == 'true'"), `${name}.${id}: falta o interruptor do workflow`);
        assert.ok(job.if.includes(`fromJSON(needs.config.outputs.jobs).${id}`), `${name}.${id}: falta o interruptor do job`);
      }
    });
  }
});
