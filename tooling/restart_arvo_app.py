#!/usr/bin/env python3
"""Restart exactly one PM2 process rooted in this ARVO app directory."""
import json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
result=subprocess.run(['pm2','jlist'],capture_output=True,text=True,check=True)
try:processes=json.loads(result.stdout)
except ValueError:raise SystemExit('PM2 process list could not be parsed; no service restarted. Run pm2 list and share its output.')
matches=[p for p in processes if Path((p.get('pm2_env') or {}).get('pm_cwd','/')).resolve()==root]
if len(matches)!=1:raise SystemExit(f'Found {len(matches)} PM2 processes rooted in the ARVO app directory; no service restarted. Run pm2 list and share its output.')
p=matches[0]
print(f'Restarting ARVO process {p["pm_id"]}: {p.get("name","")}',flush=True)
subprocess.run(['pm2','restart',str(p['pm_id'])],check=True)
