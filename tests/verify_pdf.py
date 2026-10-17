from pathlib import Path
import json
from pypdf import PdfReader
root=Path('../tmp/v2/pdfs')
files=[Path('dist/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf'),*sorted(root.glob('*.pdf'))]
results=[]
for file in files:
    reader=PdfReader(file)
    fields=reader.get_fields() or {}
    assert len(fields)>=9,(file.name,'missing fields')
    expected_file=file.with_suffix('.json')
    if file.name=='browser-repeat.pdf':expected_file=root/'browser-filled.json'
    expected=json.loads(expected_file.read_text()) if expected_file.exists() else {}
    if expected:
        for key,value in expected.items():
            names=sorted((name for name in fields if name==key or name.startswith(key+'__')),key=lambda n:int(n.split('__')[1]) if '__' in n else 1)
            assert ''.join(str(fields[n].get('/V','')) for n in names)==value,(file.name,key,'canonical')
    count=0
    for page in reader.pages:
        assert abs(float(page.mediabox.width)-595.28)<1
        for ref in page.get('/Annots',[]):
            widget=ref.get_object()
            if widget.get('/Subtype')!='/Widget':continue
            effective=widget.get('/Parent',widget).get_object()
            key=effective['/T']
            assert key in fields
            assert effective.get('/V','')==fields[key].get('/V',''),(file.name,key,'widget')
            assert widget['/AP']['/N'].get_object().get_data(),(file.name,key,'appearance')
            assert not int(effective.get('/Ff',0)) & 1,(file.name,key,'readonly')
            x0,y0,x1,y1=map(float,widget['/Rect'])
            assert x0>=51 and x1<=544 and y0>=79 and y1<700,(file.name,key,'rectangle')
            count+=1
    assert count==len(fields),(file.name,'field tree and widgets differ')
    results.append({'file':file.name,'pages':len(reader.pages),'fields':count,'canonicalAndWidgetsAgree':True,'nonemptyAppearances':True})
print(json.dumps(results,indent=2))
(root.parent/'pdf-results.json').write_text(json.dumps(results,indent=2))
