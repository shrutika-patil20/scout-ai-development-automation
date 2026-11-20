"""Read-only GitHub polling via gh CLI; no token stored in SQLite."""
import json,subprocess
from .core import db,event,stamp
def poll(repo):
 if not repo or '/' not in repo or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_/.' for c in repo):raise ValueError('Expected owner/repo')
 result=subprocess.run(['gh','pr','list','--repo',repo,'--state','open','--limit','30','--json','number,title,url,headRefName,baseRefName'],capture_output=True,text=True,timeout=30,check=True)
 prs=json.loads(result.stdout);c=db()
 try:
  with c:
   for p in prs:
    c.execute('INSERT INTO pull_requests(number,title,url,head,base,state,review_status,updated) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(number) DO UPDATE SET title=excluded.title,url=excluded.url,head=excluded.head,base=excluded.base,state=excluded.state,updated=excluded.updated',(p['number'],p['title'],p['url'],p['headRefName'],p['baseRefName'],'OPEN','PENDING_REVIEW',stamp()))
   event(c,'GitHub Monitor','POLL',f'{repo}: {len(prs)} open PRs')
  return {'repository':repo,'count':len(prs)}
 finally:c.close()
# Deliberately no merge function: merging requires separate enterprise integration and approval.
