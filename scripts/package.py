"""Package the full Netlify project; dist alone does not provide access protection."""
from pathlib import Path
import hashlib,json,shutil,zipfile
root=Path(__file__).resolve().parent.parent
out=root.parent/'output'
project=out/'der-wirtschaftsbund-netlify'
out.mkdir(parents=True,exist_ok=True)
expected={'index.html','bund.html','projekte.html','aufnahme.html','impressum.html','datenschutz.html','404.html','robots.txt','_headers'}
assert {p.name for p in (root/'dist').iterdir() if p.is_file()}==expected
assert not any(p.is_symlink() for p in (root/'dist').rglob('*'))
assert not any(p.name.startswith('.') or p.suffix in {'.map','.json','.md','.log'} for p in (root/'dist').rglob('*'))
files=[root/name for name in ['README.md','package.json','package-lock.json','.gitignore','netlify.toml']]
for folder in ['src','scripts','tests','docs','netlify','dist']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and not p.name.startswith('.') and '__pycache__' not in p.parts)
for p in files:
 assert not p.is_symlink(),p
 assert p.suffix not in {'.pem','.key','.log'},p
 assert not p.name.startswith('.env'),p
if project.exists():shutil.rmtree(project)
project.mkdir()
for source in files:
 target=project/source.relative_to(root);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
required=['netlify.toml','netlify/edge-functions/00-access.js','netlify/edge-functions/10-login.js','netlify/lib/security.js','netlify/lib/login-view.js','netlify/lib/access-keys.js','src/data/access.js','dist/assets/access.css','dist/index.html','dist/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf','package-lock.json']
for name in required:assert (project/name).is_file(),name
archive=out/'Der_Wirtschaftsbund_Netlify_Projekt.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(project.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(project).as_posix())
manifest={p.relative_to(project).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(project.rglob('*')) if p.is_file()}
with zipfile.ZipFile(archive) as z:
 assert sorted(z.namelist())==sorted(manifest)
 for name,digest in manifest.items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
(out/'NETLIFY_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
for p in (root/'docs').glob('*.md'):shutil.copy2(p,out/p.name)
# Remove only the precisely named generated handoff artifacts this package supersedes.
for name in ['Der_Wirtschaftsbund_Upload.zip','Der_Wirtschaftsbund_Quellcode.zip','UPLOAD_SHA256.json']:
 (out/name).unlink(missing_ok=True)
old=out/'der-wirtschaftsbund-upload'
if old.is_dir():shutil.rmtree(old)
proof={'project':str(project),'archive':archive.name,'files':len(manifest),'publishFiles':sum(1 for n in manifest if n.startswith('dist/')),'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'zipContentsMatchProject':True,'edgeSourcesIncluded':True,'staticOnlyDeploymentSufficient':False,'credentialsIncluded':False}
(out/'PAKETNACHWEIS.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof,indent=2))
