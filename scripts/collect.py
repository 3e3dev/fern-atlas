import urllib.request, urllib.parse, json, time, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def api(**kw):
    url='https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(dict(action='query',format='json',**kw))
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'FernAtlas/1.0 (botanical educational website)'}),timeout=60))
        except Exception:
            if attempt==3: raise
            time.sleep(2+attempt)
members=api(list='categorymembers',cmtitle='Category:Ferns of the Americas',cmlimit=500)['query']['categorymembers']
(ROOT/'data/category.json').write_text(json.dumps(members,indent=2))
names=[m['title'] for m in members if m['ns']==0]
rows=[]
for i in range(0,len(names),20):
    result=api(titles='|'.join(names[i:i+20]),prop='extracts|pageimages|info',exintro=1,explaintext=1,piprop='original',inprop='url',redirects=1)
    for p in result['query']['pages'].values():
        name=p['title']; text=p.get('extract','')
        rows.append(dict(id=str(p['pageid']),name=name,genus=name.split()[0],kind='Species' if ' ' in name and '(plant)' not in name else 'Genus',description=text,source=p.get('fullurl','https://en.wikipedia.org/wiki/'+name.replace(' ','_')),reference=p.get('original',{}).get('source'),image=None))
    print('Collected',len(rows),flush=True)
    (ROOT/'data/ferns.json').write_text(json.dumps(sorted(rows,key=lambda r:r['name']),ensure_ascii=False,indent=2))
