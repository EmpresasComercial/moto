const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let data = fs.readFileSync(fullPath, 'utf8');
      
      // Remove JSX block comments: {/* ... */}
      data = data.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
      
      // Remove JS block comments: /* ... */
      data = data.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove JS single line comments: // ... (only if they start the line to avoid URLs)
      data = data.replace(/^\s*\/\/.*$/gm, '');
      
      // Remove eslint-disable comments which might have been missed
      data = data.replace(/^\s*\/\/ eslint-disable.*$/gm, '');
      
      fs.writeFileSync(fullPath, data);
    }
  }
}

processDir('src/components');
processDir('src/lib');
console.log('Comments removed from components and lib.');
