#!/usr/bin/env python3
"""Verify the approved testnet binding and fill missing public app settings only."""
import os,re,shlex,subprocess,shutil
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1]
expected={'NEXT_PUBLIC_STAKING_CHAIN_ID':'46630','NEXT_PUBLIC_STAKING_PROXY_ADDRESS':'0x54697F1BE0E26d079CEb97992df54b8A700C6968'}
rpc_key='NEXT_PUBLIC_STAKING_RPC_URL'
keys=set(expected)|{rpc_key}
values={}
for name in ['.env','.env.production','.env.local','.env.production.local']:
 p=root/name
 if p.is_symlink():raise SystemExit('Environment file is a symbolic link; stopped.')
 if not p.exists():continue
 for line in p.read_text().splitlines():
  match=re.match(r'^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$',line)
  if not match or match[1] not in keys:continue
  try:parts=shlex.split(match[2],comments=True)
  except ValueError:raise SystemExit('A public staking setting has invalid quoting; stopped.')
  value=parts[0] if parts else ''
  if match[1] in expected and value and value.lower()!=expected[match[1]].lower():raise SystemExit(f'{name}: {match[1]} points to a different deployment; stopped without changes.')
  values[match[1]]=value
for key in keys:
 if key in os.environ:
  value=os.environ[key]
  if key in expected and value.lower()!=expected[key].lower():raise SystemExit(f'Exported {key} points to a different deployment; stopped.')
  values[key]=value
rpc=values.get(rpc_key) or 'https://rpc.testnet.chain.robinhood.com'
if not rpc.startswith(('https://','http://')):raise SystemExit('Invalid staking RPC; stopped.')
cast='/root/.foundry/bin/cast'
def read(*args):
 result=subprocess.run([cast,*args,'--rpc-url',rpc],capture_output=True,text=True,timeout=40)
 if result.returncode:raise SystemExit('Unable to verify testnet through the configured RPC; stopped without changes.')
 return result.stdout.strip()
proxy=expected['NEXT_PUBLIC_STAKING_PROXY_ADDRESS']
if read('chain-id')!='46630':raise SystemExit('Configured RPC is not Robinhood testnet; stopped.')
escrow=read('call',proxy,'acquisitionEscrow()(address)')
if escrow.lower()!='0x8da5adc09050992a9afd35c3d23f69947d10bd0b':raise SystemExit('Proxy escrow differs from the approved deployment; stopped.')
if read('call',escrow,'controller()(address)').lower()!=proxy.lower():raise SystemExit('Escrow controller mismatch; stopped.')
if read('call',escrow,'usdc()(address)').lower()!=read('call',proxy,'usdc()(address)').lower():raise SystemExit('Escrow token mismatch; stopped.')
missing={k:v for k,v in {**expected,rpc_key:rpc}.items() if not values.get(k)}
if missing:
 p=root/'.env.production.local'
 backup=Path('/home/arvoprotocol/backups');backup.mkdir(parents=True,exist_ok=True)
 if p.exists():
  saved=backup/('acquisition-app-env-'+datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f'))
  shutil.copy2(p,saved);saved.chmod(0o600)
 info=p.stat() if p.exists() else (root/'package.json').stat()
 data=p.read_text() if p.exists() else ''
 # Remove empty definitions of these keys before appending the reviewed values.
 data='\n'.join(line for line in data.splitlines() if not any(re.match(r'^\s*(?:export\s+)?'+re.escape(k)+r'\s*=',line) for k in missing))+'\n'
 data+='\n# Approved acquisition testnet binding\n'+''.join(k+'='+v+'\n' for k,v in missing.items())
 p.write_text(data);p.chmod(0o600)
 if os.geteuid()==0:os.chown(p,info.st_uid,info.st_gid)
 print('Added missing public staking settings in .env.production.local.')
print('Verified Robinhood testnet, staking proxy, escrow controller and USDC binding. Existing non-empty settings retained.')
