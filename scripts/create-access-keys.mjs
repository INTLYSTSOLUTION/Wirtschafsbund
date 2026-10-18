// Replaces the accepted key list. Plaintext is written only to the chosen private folder.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=process.argv[2]&&path.resolve(process.argv[2]);
if(!destination||destination===root||destination.startsWith(root+path.sep))throw Error('Specify a private output folder outside the project. Existing files will not be overwritten.');
process.umask(0o077);
await fs.mkdir(destination,{recursive:true,mode:0o700});
await fs.chmod(destination,0o700);
const keysPath=path.join(destination,'Wirtschaftsbund_100_Zugangsschluessel.txt');
const envPath=path.join(destination,'Netlify_Umgebungsvariablen.env');
for(const file of [keysPath,envPath]){if(await fs.stat(file).catch(()=>null))throw Error('Private output already exists. Choose a new private folder for a new key batch.');}
const keys=Array.from({length:100},()=>randomBytes(24).toString('base64url'));
if(new Set(keys).size!==100)throw Error('Unexpected duplicate key.');
const digests=keys.map(key=>createHash('sha256').update(key).digest('hex'));
const intro='DER WIRTSCHAFTSBUND — 100 ZUGANGSSCHLÜSSEL\n\nVertraulich. Jeweils nur den einzelnen Schlüssel weitergeben, nicht diese Liste.\nJeder Schlüssel ist wiederverwendbar. Die Nummer gehört nicht zum Schlüssel.\nDie Schlüssel gelten nach vollständigem Netlify-Deployment dieses Projektstands\nund Einrichtung der Werte aus Netlify_Umgebungsvariablen.env.\nDiese Dateien niemals auf GitHub oder in den Veröffentlichungsordner hochladen.\n\n';
await fs.writeFile(keysPath,intro+keys.map((key,i)=>`${String(i+1).padStart(3,'0')}: ${key}`).join('\n')+'\n',{flag:'wx',mode:0o600});
const settings='# Nur für die Betreiber: in Netlify als Production-Variablen im Scope Functions setzen.\n# Nicht auf GitHub hochladen oder an Besucher weitergeben. Anschließend neu deployen.\n# Die tatsächliche Netlify-Hauptadresse bei Bedarf mit Komma an ACCESS_ALLOWED_HOSTS anhängen.\n# ACCESS_PASSWORD leer lassen bzw. vorhandene Variable löschen: Zugriff nur über die 100 Schlüssel.\n'+`ACCESS_SESSION_SECRET=${randomBytes(48).toString('base64url')}\nACCESS_ALLOWED_HOSTS=wirtschaftsbund.cloud\nACCESS_PASSWORD=\n`;
await fs.writeFile(envPath,settings,{flag:'wx',mode:0o600});
await fs.writeFile(path.join(root,'netlify/lib/access-keys.js'),'// SHA-256 of 100 independently generated 192-bit random access keys.\n// Plaintext is delivered separately and must never be committed.\n// Remove a numbered digest and redeploy to revoke that key (all sessions expire).\nexport const ACCESS_KEY_DIGESTS = Object.freeze([\n'+digests.map((digest,i)=>`  '${digest}', // ${String(i+1).padStart(3,'0')}`).join('\n')+'\n]);\n',{mode:0o644});
console.log('Created 100 unique access keys in private files; only their SHA-256 digests were written to the project. No values printed.');
