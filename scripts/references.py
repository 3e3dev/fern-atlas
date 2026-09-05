import json,urllib.request,pathlib,concurrent.futures,subprocess,time
root=pathlib.Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/ferns.json').read_text())
def fetch(f):
    if not f['reference']:return
    dest=root/'references'/str(f['id'])
    png=dest.with_suffix('.png')
    if png.exists():return
    for n in range(2):
        try:
            url=f['reference'].split('?')[0]
            base,filename=url.rsplit('/',1)
            url=base.replace('/commons/','/commons/thumb/')+'/'+filename+'/500px-'+filename
            req=urllib.request.Request(url,headers={'User-Agent':'FernAtlas/1.0 educational botanical reference collection'})
            with urllib.request.urlopen(req,timeout=60) as response:dest.write_bytes(response.read())
            subprocess.run(['sips','-s','format','png','-Z','700',str(dest),'--out',str(png)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            dest.unlink();print(f['name'],flush=True);time.sleep(2);return
        except Exception as e:
            if n==1:print('FAILED',f['name'],str(e),flush=True)
            time.sleep(10+n*10)
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:list(pool.map(fetch,rows))
