import unittest,tempfile
from pathlib import Path
from unittest.mock import patch
from backend import core
class WorkflowTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();root=Path(self.tmp.name);(root/'sample/inbox').mkdir(parents=True);(root/'sample/repository').mkdir(parents=True)
  (root/'sample/inbox/meeting.txt').write_text('REQ: Round invoice totals to two decimal places.\n');(root/'sample/repository/app.py').write_text('def total(x):\n    return x\n')
  self.patches=[patch.object(core,'DB',root/'db.sqlite3'),patch.object(core,'INBOX',root/'sample/inbox'),patch.object(core,'REPO',root/'sample/repository')]
  for x in self.patches:x.start()
 def tearDown(self):
  for x in self.patches:x.stop()
  self.tmp.cleanup()
 def test_ingest_idempotent(self):
  self.assertEqual(core.ingest()['new_sources'],1);self.assertEqual(core.ingest()['new_sources'],0);self.assertEqual(len(core.query('requirements')),1)
 def test_approval_gate_and_apply(self):
  core.ingest();p=core.propose(1,'app.py','def total(x):\n    return x\n','def total(x):\n    return round(x,2)\n');pid=p['proposal_id']
  with self.assertRaises(ValueError):core.apply(pid)
  a=core.query('approvals')[0];core.approve(a['id'],'APPROVED','Demo reviewer','Reviewed diff')
  self.assertEqual(core.apply(pid)['status'],'APPLIED');self.assertIn('round', (core.REPO/'app.py').read_text())
 def test_stale_base_rejected(self):
  core.ingest();p=core.propose(1,'app.py','def total(x):\n    return x\n','def total(x):\n    return 3\n');a=core.query('approvals')[0];core.approve(a['id'],'APPROVED','Demo','Reviewed')
  (core.REPO/'app.py').write_text('changed')
  with self.assertRaises(ValueError):core.apply(p['proposal_id'])
 def test_reject_prevents_apply(self):
  core.ingest();p=core.propose(1,'app.py','def total(x):\n    return x\n','def total(x):\n    return 3\n');a=core.query('approvals')[0];core.approve(a['id'],'REJECTED','Demo','Unsafe')
  with self.assertRaises(ValueError):core.apply(p['proposal_id'])
 def test_traversal_rejected(self):
  core.ingest()
  with self.assertRaises(ValueError):core.propose(1,'../outside.py','a','b')
if __name__=='__main__':unittest.main()
