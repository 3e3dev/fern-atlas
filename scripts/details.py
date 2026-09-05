import json,urllib.request,urllib.parse,time,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'data/ferns.json';rows=json.loads(p.read_text())
for i in range(0,len(rows),20):
    params=dict(action='query',format='json',pageids='|'.join(r['id'] for r in rows[i:i+20]),prop='extracts',explaintext=1,exchars=6500,exlimit='max')
    url='https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'FernAtlas/1.0 educational botanical atlas'}),timeout=60) as response:data=json.load(response)
    for r in rows[i:i+20]:
        text=data['query']['pages'][r['id']].get('extract','')
        text=re.split(r'\n== (?:References|External links|See also|Further reading|Notes|Bibliography) ==',text)[0].strip()
        r['details']=text or r['description']
    p.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('Enriched',min(i+20,len(rows)),flush=True);time.sleep(1)
