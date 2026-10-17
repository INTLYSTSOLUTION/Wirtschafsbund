"""Package only public build files; keep sources and documentation separate."""
from pathlib import Path
import hashlib,json,shutil,zipfile
root=Path(__file__).resolve().parent.parent
out=root.parent/'output'
upload=out/'der-wirtschaftsbund-upload'
source=root/'dist'
expected={'index.html','bund.html','projekte.html','aufnahme.html','impressum.html','datenschutz.html','404.html','robots.txt','_headers'}
actual={p.name for p in source.iterdir() if p.is_file()}
assert expected<=actual and actual<=expected|{'sitemap.xml'},actual
assert not any(p.is_symlink() for p in source.rglob('*'))
assert not any(p.name.startswith('.') or p.suffix in {'.map','.json','.md','.log'} for p in source.rglob('*'))
assert (source/'assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf').is_file()
out.mkdir(parents=True,exist_ok=True)
if upload.exists():shutil.rmtree(upload)
shutil.copytree(source,upload)
def archive(destination,files,base):
    with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as z:
        for file in sorted(files):z.write(file,file.relative_to(base).as_posix())
archive(out/'Der_Wirtschaftsbund_Upload.zip',[p for p in upload.rglob('*') if p.is_file()],upload)
source_files=[root/p for p in ['README.md','package.json','package-lock.json','.gitignore']]
for folder in ['src','scripts','tests','docs']:
    source_files.extend(p for p in (root/folder).rglob('*') if p.is_file() and not p.name.startswith('.') and '__pycache__' not in p.parts)
archive(out/'Der_Wirtschaftsbund_Quellcode.zip',source_files,root)
for file in (root/'docs').glob('*.md'):shutil.copy2(file,out/file.name)
manifest={p.relative_to(upload).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(upload.rglob('*')) if p.is_file()}
(out/'UPLOAD_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'upload':str(upload),'publicFiles':len(manifest),'zipBytes':(out/'Der_Wirtschaftsbund_Upload.zip').stat().st_size,'sourceFiles':len(source_files)},indent=2))
