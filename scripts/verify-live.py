"""Verify that Pages serves this commit and exact public asset bytes."""
import hashlib,json,os,time,urllib.request,urllib.parse,pathlib
base=os.environ['SITE_URL'].rstrip('/')+'/'
assert base.startswith('https://zyrobbie.github.io/cat-letters-playground/'), 'Unexpected deployment destination'
expected=os.environ['GITHUB_SHA']; deadline=time.monotonic()+600
result={'url':base,'expected_revision':expected,'ok':False,'files':[]}
def fetch(path):
    q='revision='+urllib.parse.quote(expected)
    req=urllib.request.Request(base+urllib.parse.quote(path,safe='/')+'?'+q, headers={'Cache-Control':'no-cache','User-Agent':'cat-playground-release-check'})
    with urllib.request.urlopen(req,timeout=30) as r:
        assert r.status==200
        return r.read()
try:
    while True:
        try:
            manifest=json.loads(fetch('version.json'))
            assert manifest['revision']==expected, 'Pages has not converged to this revision'
            for item in manifest['files']:
                data=fetch(item['path'])
                assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'], 'Mismatch: '+item['path']
            result.update(ok=True,revision=manifest['revision'],files=manifest['files'])
            break
        except Exception as e:
            result['last_error']=str(e)
            if time.monotonic()>=deadline: raise
            time.sleep(15)
finally:
    pathlib.Path('live-integrity.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
assert result['ok']
print(f"Verified {len(result['files'])} live files for {expected}")
