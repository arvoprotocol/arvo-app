#!/usr/bin/env python3
"""Offline regression checks for testnet configuration and scoped restart helpers."""
import contextlib,io,json,os,runpy,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
SOURCE=Path(__file__).resolve().parent
PROXY='0x54697F1BE0E26d079CEb97992df54b8A700C6968'
ESCROW='0x8Da5adC09050992A9AFD35C3d23f69947D10bD0B'
TOKEN='0xD6554EB0B9fBCb8d8f423Ad4Bf842D473bE6d6B2'
class DeploymentHelpers(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)/'app';(self.root/'tooling').mkdir(parents=True);(self.root/'package.json').write_text('{}');self.calls=[]
 def tearDown(self):self.tmp.cleanup()
 def execute(self,name,runner):
  source=(SOURCE/name).read_text().replace("Path('/home/arvoprotocol/backups')",repr(str(Path(self.tmp.name)/'backups')))
  # Keep the actual Path constructor in the isolated fixture.
  source=source.replace("backup='", "backup=Path('").replace("backups';backup.mkdir", "backups');backup.mkdir")
  script=self.root/'tooling'/name;script.write_text(source)
  with patch.dict(os.environ,{},clear=True),patch('subprocess.run',side_effect=runner),contextlib.redirect_stdout(io.StringIO()):runpy.run_path(str(script),run_name='__main__')
 def rpc(self,args,**kwargs):
  self.calls.append(args)
  if args[1]=='chain-id':value='46630'
  elif args[3]=='acquisitionEscrow()(address)':value=ESCROW
  elif args[3]=='controller()(address)':value=PROXY
  elif args[3]=='usdc()(address)':value=TOKEN
  else:raise AssertionError(args)
  return subprocess.CompletedProcess(args,0,value+'\n','')
 def test_missing_settings_fill_highest_priority_local_file(self):
  (self.root/'.env').write_text('OTHER_SETTING=retained\n');(self.root/'.env.production.local').write_text('NEXT_PUBLIC_STAKING_CHAIN_ID=\n')
  self.execute('configure_acquisition_testnet.py',self.rpc)
  data=(self.root/'.env.production.local').read_text();self.assertIn('NEXT_PUBLIC_STAKING_CHAIN_ID=46630',data);self.assertIn(PROXY,data);self.assertEqual((self.root/'.env').read_text(),'OTHER_SETTING=retained\n')
 def test_existing_mainnet_settings_are_rejected_without_changes(self):
  p=self.root/'.env';p.write_text('NEXT_PUBLIC_STAKING_CHAIN_ID=4663\n')
  with self.assertRaises(SystemExit):self.execute('configure_acquisition_testnet.py',self.rpc)
  self.assertEqual(p.read_text(),'NEXT_PUBLIC_STAKING_CHAIN_ID=4663\n');self.assertFalse((self.root/'.env.production.local').exists());self.assertEqual(self.calls,[])
 def test_wrong_module_stops_before_environment_write(self):
  def wrong(args,**kwargs):
   response=self.rpc(args,**kwargs)
   if args[1]=='call' and args[3]=='acquisitionEscrow()(address)':response.stdout=TOKEN
   return response
  with self.assertRaises(SystemExit):self.execute('configure_acquisition_testnet.py',wrong)
  self.assertFalse((self.root/'.env.production.local').exists())
 def test_existing_custom_rpc_and_settings_are_retained(self):
  data=f'NEXT_PUBLIC_STAKING_CHAIN_ID=46630\nNEXT_PUBLIC_STAKING_PROXY_ADDRESS={PROXY}\nNEXT_PUBLIC_STAKING_RPC_URL=https://example.invalid/rpc\n'
  p=self.root/'.env.local';p.write_text(data);self.execute('configure_acquisition_testnet.py',self.rpc);self.assertEqual(p.read_text(),data);self.assertFalse((self.root/'.env.production.local').exists());self.assertTrue(all(x[-1]=='https://example.invalid/rpc' for x in self.calls))
 def restart(self,rows):
  def runner(args,**kwargs):
   self.calls.append(args);return subprocess.CompletedProcess(args,0,json.dumps(rows) if args==['pm2','jlist'] else '', '')
  return runner
 def test_restart_selects_only_arvo_cwd(self):
  rows=[{'pm_id':2,'name':'another-site','pm2_env':{'pm_cwd':'/another-site'}},{'pm_id':42,'name':'arvo','pm2_env':{'pm_cwd':str(self.root)}}]
  self.execute('restart_arvo_app.py',self.restart(rows));self.assertEqual(self.calls[-1],['pm2','restart','42'])
 def test_ambiguous_restart_stops_without_restarting(self):
  rows=[{'pm_id':i,'pm2_env':{'pm_cwd':str(self.root)}} for i in [1,2]]
  with self.assertRaises(SystemExit):self.execute('restart_arvo_app.py',self.restart(rows))
  self.assertEqual(self.calls,[['pm2','jlist']])
if __name__=='__main__':unittest.main()
