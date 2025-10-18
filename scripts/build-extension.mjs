import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Files and directories to copy
const filesToCopy = [
  'manifest.json',
  { src: 'src', dest: 'src' },
  { src: 'icons', dest: 'icons' }
];

// Copy files and directories
console.log('Copying files to dist directory...');
filesToCopy.forEach(item => {
  const srcPath = typeof item === 'string' ? path.join(rootDir, item) : path.join(rootDir, item.src);
  const destPath = typeof item === 'string' ? path.join(distDir, item) : path.join(distDir, item.dest);
  
  if (fs.lstatSync(srcPath).isDirectory()) {
    copyDirectory(srcPath, destPath);
  } else {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${srcPath} -> ${destPath}`);
  }
});

// Create zip file
console.log('Creating extension.zip...');
const output = fs.createWriteStream(path.join(distDir, 'extension.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);

// Adicionar arquivos individualmente ao zip em vez da pasta dist inteira
filesToCopy.forEach(item => {
  const srcPath = typeof item === 'string' ? path.join(distDir, item) : path.join(distDir, item.dest);
  const zipPath = typeof item === 'string' ? item : item.dest;
  
  if (fs.lstatSync(srcPath).isDirectory()) {
    archive.directory(srcPath, zipPath);
  } else {
    archive.file(srcPath, { name: zipPath });
  }
});

output.on('close', () => {
  console.log(`Extension packaged successfully: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.finalize();

// Helper function to copy directories recursively
function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}