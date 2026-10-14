const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const ignoredDirs = new Set(['.git', 'node_modules', 'dist']);

const extensions = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs',
  '.json', '.html', '.css', '.sql', '.prisma',
  '.md', '.yml', '.yaml'
]);

let totalReplacements = 0;
let modifiedFiles = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.has(ext)) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('FoDeMEEP')) {
      const regex = /FoDeMEEP/g;
      const count = (content.match(regex) || []).length;
      const newContent = content.replace(regex, 'FoDeMEEP');
      fs.writeFileSync(filePath, newContent, 'utf-8');
      totalReplacements += count;
      modifiedFiles++;
      const rel = path.relative(projectRoot, filePath);
      console.log(`Modificado: ${rel} (${count} reemplazos)`);
    }
  } catch (err) {
    console.error(`Error procesando ${filePath}:`, err.message);
  }
}

console.log('Iniciando reemplazo de FoDeMEEP -> FoDeMEEP...');
walk(projectRoot);
console.log(`\nFinalizado: ${totalReplacements} reemplazos realizados en ${modifiedFiles} archivos.`);
