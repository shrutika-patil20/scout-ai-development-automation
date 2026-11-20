import sqlite3,json,hashlib,re,difflib,subprocess,os
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]; DB=ROOT/'data.sqlite3'; INBOX=ROOT/'sample/inbox'; REPO=ROOT/'sample/repository'
def stamp():return datetime.now(timezone.utc).isoformat(timespec='seconds')
def db():
 c=sqlite3.connect(DB,timeout=15);c.row_factory=sqlite3.Row;c.execute('PRAGMA journal_mode=WAL');c.executescript("""CREATE TABLE IF NOT EXISTS sources(id INTEGER PRIMARY KEY,filename TEXT UNIQUE,digest TEXT,body TEXT,created TEXT);CREATE TABLE IF NOT EXISTS requirements(id INTEGER PRIMARY KEY,source_id INTEGER,title TEXT,detail TEXT,priority TEXT,criteria TEXT,status TEXT,created TEXT);CREATE TABLE IF NOT EXISTS proposals(id INTEGER PRIMARY KEY,requirement_id INTEGER,path TEXT,old_text TEXT,new_text TEXT,diff TEXT,status TEXT,created TEXT);CREATE TABLE IF NOT EXISTS approvals(id INTEGER PRIMARY KEY,proposal_id INTEGER,kind TEXT,status TEXT,actor TEXT,reason TEXT,created TEXT);CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY,proposal_id INTEGER,category TEXT,severity TEXT,detail TEXT);CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,agent TEXT,action TEXT,details TEXT,created TEXT);CREATE TABLE IF NOT EXISTS pull_requests(id INTEGER PRIMARY KEY,number INTEGER UNIQUE,title TEXT,url TEXT,head TEXT,base TEXT,state TEXT,review_status TEXT,updated TEXT);""");c.commit();return c
def event(c,agent,action,details):c.execute('INSERT INTO events(agent,action,details,created) VALUES(?,?,?,?)',(agent,action,details,stamp()))
def ingest():
 c=db();count=0
 try:
  for f in sorted(INBOX.glob('*')):
   if not f.is_file() or f.suffix.lower() not in ('.txt','.md','.eml'):continue
   raw=f.read_text(encoding='utf-8');digest=hashlib.sha256(raw.encode()).hexdigest()
   if c.execute('SELECT 1 FROM sources WHERE filename=? AND digest=?',(f.name,digest)).fetchone():continue
   # Changed sources are deliberately not overwritten: reviewer must handle a new version.
   if c.execute('SELECT 1 FROM sources WHERE filename=?',(f.name,)).fetchone():continue
   with c:
    sid=c.execute('INSERT INTO sources(filename,digest,body,created) VALUES(?,?,?,?)',(f.name,digest,raw,stamp())).lastrowid
    # Deterministic sample extraction only. Scout should enrich these drafts.
    matches=re.findall(r'(?im)^(?:REQ|ACTION|REQUEST)\s*:\s*(.+)$',raw)
    if not matches:matches=['Review source and extract requirements manually']
    for title in matches:
     c.execute('INSERT INTO requirements(source_id,title,detail,priority,criteria,status,created) VALUES(?,?,?,?,?,?,?)',(sid,title[:200],raw[:8000],'MEDIUM','Pending human/Scout enrichment','DRAFT',stamp()))
    event(c,'Requirements Analyst','SOURCE_INGESTED',f.name)
   count+=1
  # Generate deterministic requirement drafts for review; Scout may enrich them.
  docs=ROOT/'generated_requirements';docs.mkdir(exist_ok=True)
  for row in c.execute('SELECT r.id,r.title,r.priority,r.criteria,s.filename FROM requirements r JOIN sources s ON s.id=r.source_id'):
   content=(f'# Requirement R{row[0]}: {row[1]}\n\n**Source:** {row[4]}\n\n**Priority:** {row[2]}\n\n## Acceptance criteria\n\n{row[3]}\n\n## Status\n\nDraft — requires Scout/human validation.\n')
   (docs/f'REQ-{row[0]:04d}.md').write_text(content,encoding='utf-8')
  return {'new_sources':count} 
 finally:c.close()
def propose(requirement_id,path='app.py',old=None,new=None):
 # Candidate patch is never executed or applied here.
 if not re.fullmatch(r'[A-Za-z0-9_./-]+',path) or '..' in Path(path).parts:raise ValueError('Invalid path')
 target=(REPO/path).resolve()
 if not target.is_relative_to(REPO.resolve()) or not target.is_file():raise ValueError('Target must be an existing repository file')
 current=target.read_text(encoding='utf-8')
 if old is None:old=current
 if current!=old:raise ValueError('Stale base content')
 if new is None:raise ValueError('Proposed content required')
 if len(new)>200000:raise ValueError('Patch too large')
 c=db()
 try:
  if not c.execute('SELECT 1 FROM requirements WHERE id=?',(requirement_id,)).fetchone():raise ValueError('Unknown requirement')
  diff=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
  if not diff:raise ValueError('No changes')
  with c:
   pid=c.execute('INSERT INTO proposals(requirement_id,path,old_text,new_text,diff,status,created) VALUES(?,?,?,?,?,?,?)',(requirement_id,path,old,new,diff,'AWAITING_APPROVAL',stamp())).lastrowid
   c.execute('INSERT INTO approvals(proposal_id,kind,status,actor,reason,created) VALUES(?,?,?,?,?,?)',(pid,'APPLY','PENDING',None,None,stamp()))
   event(c,'Code Engineer','PATCH_PROPOSED',f'proposal {pid}')
  review(pid)
  return {'proposal_id':pid,'diff':diff}
 finally:c.close()
def review(pid):
 c=db()
 try:
  x=c.execute('SELECT * FROM proposals WHERE id=?',(pid,)).fetchone()
  if not x:raise ValueError('Unknown proposal')
  findings=[];new=x['new_text']
  if re.search(r'\beval\s*\(|\bexec\s*\(',new):findings.append(('security','HIGH','Dynamic execution detected'))
  if re.search(r'(?i)(password|api_key|secret)\s*=\s*[\'\"][^\'\"]+',new):findings.append(('security','HIGH','Possible hardcoded credential'))
  if 'except:' in new:findings.append(('maintainability','MEDIUM','Bare except clause'))
  if len(new.splitlines())>250:findings.append(('architecture','MEDIUM','Large module; review single-responsibility concerns'))
  if not findings:findings.append(('style','INFO','No flagged patterns in limited static checks; manual SOLID/design review still required'))
  with c:
   c.execute('DELETE FROM reviews WHERE proposal_id=?',(pid,))
   for cat,sev,msg in findings:c.execute('INSERT INTO reviews(proposal_id,category,severity,detail) VALUES(?,?,?,?)',(pid,cat,sev,msg))
   event(c,'Review Guardian','REVIEW_COMPLETED',f'proposal {pid}')
  return findings
 finally:c.close()
def approve(approval_id,decision,actor,reason):
 if decision not in ('APPROVED','REJECTED'):raise ValueError('Invalid decision')
 if not actor.strip() or not reason.strip():raise ValueError('Actor and reason required')
 c=db()
 try:
  with c:
   a=c.execute('SELECT * FROM approvals WHERE id=?',(approval_id,)).fetchone()
   if not a or a['status']!='PENDING':raise ValueError('Approval missing or already decided')
   c.execute('UPDATE approvals SET status=?,actor=?,reason=?,created=? WHERE id=?',(decision,actor[:100],reason[:1000],stamp(),approval_id))
   if a['kind']=='APPLY':c.execute('UPDATE proposals SET status=? WHERE id=?',('APPROVED' if decision=='APPROVED' else 'REJECTED',a['proposal_id']))
   event(c,'Approval Officer','DECISION',f'{a["kind"]} {decision} by {actor}')
  return {'status':decision}
 finally:c.close()
def apply(pid):
 c=db()
 try:
  x=c.execute('SELECT * FROM proposals WHERE id=?',(pid,)).fetchone()
  if not x or x['status']!='APPROVED':raise ValueError('Human-approved proposal required')
  a=c.execute("SELECT 1 FROM approvals WHERE proposal_id=? AND kind='APPLY' AND status='APPROVED'",(pid,)).fetchone()
  if not a:raise ValueError('Missing approval')
  target=(REPO/x['path']).resolve()
  if not target.is_relative_to(REPO.resolve()) or target.is_symlink():raise ValueError('Unsafe target')
  if target.read_text(encoding='utf-8')!=x['old_text']:raise ValueError('File changed after proposal; regenerate')
  target.write_text(x['new_text'],encoding='utf-8')
  with c:
   c.execute("UPDATE proposals SET status='APPLIED' WHERE id=?",(pid,))
   event(c,'Code Engineer','PATCH_APPLIED',f'proposal {pid}')
  return {'status':'APPLIED','path':x['path']}
 finally:c.close()
def query(table,limit=100):
 if table not in ('sources','requirements','proposals','approvals','reviews','events','pull_requests'):raise ValueError('Invalid table')
 c=db()
 try:
  rows=[dict(x) for x in c.execute(f'SELECT * FROM {table} ORDER BY id DESC LIMIT ?', (limit,))]
  if table=='proposals':
   for x in rows:x.pop('old_text',None);x.pop('new_text',None)
  if table=='sources':
   for x in rows:x.pop('body',None)
  return rows
 finally:c.close()
def report():
 req=query('requirements');prop=query('proposals');rev=query('reviews');ap=query('approvals');prs=query('pull_requests')
 lines=['# AI Development Automation — Consolidated Report',f'Generated: {stamp()}','',f'- Requirements: {len(req)}',f'- Proposals: {len(prop)}',f'- Reviews: {len(rev)}',f'- Approvals: {len(ap)}',f'- Tracked PRs: {len(prs)}','\n## Requirements']
 lines += [f'- R{x["id"]}: {x["title"]} ({x["status"]})' for x in req]
 lines += ['\n## Code proposals']+[f'- P{x["id"]}: {x["path"]} — {x["status"]}' for x in prop]
 lines += ['\n## Review findings']+[f'- {x["category"]} [{x["severity"]}]: {x["detail"]}' for x in rev]
 lines += ['\n## Human approvals']+[f'- {x["kind"]}: {x["status"]} ({x["actor"] or "unassigned"})' for x in ap]
 lines += ['\nNote: deterministic extraction and static review are limited; Scout enrichment requires a real Scout session.']
 return '\n'.join(lines)+'\n'

def _report_json_files():
 report_root=REPO/'reports'
 if report_root.is_symlink() or not report_root.is_dir():return []
 reports=report_root.resolve();pending=[reports];files=[]
 while pending:
  directory=pending.pop()
  for item in directory.iterdir():
   if item.is_symlink():continue
   if item.is_dir():pending.append(item)
   elif item.is_file() and item.suffix.lower()=='.json':
    resolved=item.resolve()
    if resolved.is_relative_to(reports):files.append(resolved)
 return sorted(files)

def _run_report_date(data):
 if not isinstance(data,dict):return None
 candidates=[data.get('date')]
 runs=data.get('runs')
 if isinstance(runs,list):candidates.extend(run.get('completedAt','')[:10] for run in runs if isinstance(run,dict) and isinstance(run.get('completedAt'),str))
 for candidate in candidates:
  if not isinstance(candidate,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',candidate):continue
  try:datetime.strptime(candidate,'%Y-%m-%d')
  except ValueError:continue
  return candidate
 return None

def run_report_dates():
 dates=set()
 for report_file in _report_json_files():
  try:data=json.loads(report_file.read_text(encoding='utf-8'))
  except (OSError,json.JSONDecodeError,UnicodeDecodeError):continue
  date=_run_report_date(data)
  if date:dates.add(date)
 return sorted(dates,reverse=True)

def read_run_report(date):
 if not isinstance(date,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',date):raise ValueError('Date must use YYYY-MM-DD format')
 try:parsed=datetime.strptime(date,'%Y-%m-%d')
 except ValueError as e:raise ValueError('Invalid report date') from e
 reports=(REPO/'reports').resolve()
 if not reports.is_relative_to(REPO.resolve()):raise ValueError('Invalid report directory')
 candidates=_report_json_files()
 runs=[]
 for candidate in candidates:
  try:data=json.loads(candidate.read_text(encoding='utf-8'))
  except (OSError,json.JSONDecodeError,UnicodeDecodeError):continue
  if _run_report_date(data)!=date:continue
  if not isinstance(data,dict) or not isinstance(data.get('runs'),list) or not all(isinstance(run,dict) for run in data['runs']):raise ValueError(f'Report file {candidate.name} must contain a runs array')
  runs.extend(data['runs'])
 if not runs:raise FileNotFoundError('No report is available for this date')
 runs.sort(key=lambda run:str(run.get('completedAt','')),reverse=True)
 return {'date':date,'runs':runs}
