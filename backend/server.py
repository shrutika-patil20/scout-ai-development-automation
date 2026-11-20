import json
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from . import core
ROOT=Path(__file__).resolve().parents[1]
class Handler(BaseHTTPRequestHandler):
 def send(self,code,data,kind='application/json'):
  body=data.encode('utf-8') if isinstance(data,str) else json.dumps(data,ensure_ascii=False).encode('utf-8')
  self.send_response(code);self.send_header('Content-Type',kind+'; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def do_GET(self):
  parsed=urlparse(self.path);path=parsed.path
  if path=='/':return self.send(200,(ROOT/'frontend/index.html').read_text(encoding='utf-8'),'text/html')
  if path=='/api/run-reports':
   try:
    dates=core.run_report_dates();query=parse_qs(parsed.query);date=query.get('date',[None])[0]
    if date is None:return self.send(200,{'dates':dates})
    return self.send(200,core.read_run_report(date))
   except FileNotFoundError as e:return self.send(404,{'error':str(e)})
   except ValueError as e:return self.send(400,{'error':str(e)})
   except OSError:return self.send(500,{'error':'Unable to read automation reports'})
  self.send(404,{'error':'Not found'})
 def log_message(self,*args):pass
if __name__=='__main__':
 print('Open http://127.0.0.1:8777');ThreadingHTTPServer(('127.0.0.1',8777),Handler).serve_forever()
