import argparse,json,time
from . import core
from .github_adapter import poll
p=argparse.ArgumentParser();p.add_argument('action',choices=['ingest','watch','report','github','sample-proposal']);p.add_argument('--repo');p.add_argument('--interval',type=int,default=10);a=p.parse_args()
if a.action=='ingest':print(core.ingest())
elif a.action=='watch':
 print('Watching sample/inbox. Ctrl+C to stop.')
 while True:
  print(core.ingest());time.sleep(max(2,a.interval))
elif a.action=='report':print(core.report())
elif a.action=='github':print(poll(a.repo))
elif a.action=='sample-proposal':
 core.ingest();r=core.query('requirements')
 if not r:raise SystemExit('No requirements found')
 from pathlib import Path
 f=core.REPO/'app.py';old=f.read_text();new=old.replace('return price * quantity','return round(price * quantity, 2)')
 print(json.dumps(core.propose(r[0]['id'],'app.py',old,new),indent=2))
