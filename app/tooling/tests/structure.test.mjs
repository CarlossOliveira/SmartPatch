import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(appRoot, '..');
const src = path.join(appRoot, 'services/frontend/src');
const layers = JSON.parse(readFileSync(path.join(appRoot, 'layers.json'), 'utf8'));

function folders(dir) {
  return readdirSync(dir).filter((name) => statSync(path.join(dir, name)).isDirectory());
}

function files(dir) {
  return readdirSync(dir).filter((name) => statSync(path.join(dir, name)).isFile());
}

describe('estrutura do repositório', () => {
  it('só tem na raiz o que o padrão permite', () => {
    const allowed = [
      'app',
      'deployment',
      'automation.config.yml',
      '.github',
      '.githooks',
      '.gitignore',
      '.git',
      '.claude',
      'README.md',
      'LICENSE',
      'SECURITY.md',
    ];
    const extra = readdirSync(repoRoot).filter((name) => !allowed.includes(name));
    assert.deepEqual(extra, []);
  });

  it('põe o src ao lado do resources, dentro do serviço', () => {
    const service = path.join(appRoot, 'services/frontend');
    assert.ok(folders(service).includes('src'));
    assert.ok(folders(service).includes('resources'));
    assert.ok(!folders(path.join(service, 'resources')).includes('src'));
  });
});

describe('camadas do src', () => {
  it('só tem pastas declaradas em layers.json, e só o index.ts solto', () => {
    assert.deepEqual(folders(src).filter((name) => !layers.top.includes(name)), []);
    assert.deepEqual(files(src), ['index.ts']);
  });

  it('segue a ordem declarada em cada unidade de componente', () => {
    const components = path.join(src, 'components');
    for (const unit of folders(components)) {
      const unknown = folders(path.join(components, unit)).filter((name) => !layers.unit.includes(name));
      assert.deepEqual(unknown, [], `${unit} tem pastas fora da ordem`);
      assert.deepEqual(files(path.join(components, unit)), ['index.ts'], `${unit}: só o index.ts na raiz`);
    }
  });
});
