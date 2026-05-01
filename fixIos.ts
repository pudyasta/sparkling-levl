import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const podfilePath = path.join(__dirname, './ios/Podfile');
let content = fs.readFileSync(podfilePath, 'utf8');

content = content.replace(
  "pod 'ios', :path => '../node_modules/sparkling-media'",
  "pod 'Sparkling-Media', :path => '../node_modules/sparkling-media/ios'"
);

fs.writeFileSync(podfilePath, content);
console.log('✓ Podfile patched: sparkling-media fixed');
