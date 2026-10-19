#!/usr/bin/env python3
"""Provision an independent app-access signing key; never print secret values."""
from pathlib import Path
import os
import secrets
import stat
import shlex

root = Path(__file__).resolve().parents[1]
path = root / ".env.local"
if path.is_symlink() or not path.is_file():
    raise SystemExit("Expected a regular .env.local in the application directory.")
mode = stat.S_IMODE(path.stat().st_mode)
if mode & 0o077:
    raise SystemExit("Restrict .env.local permissions to 600 before configuring secrets.")
text = path.read_text()
values={}
for line in text.splitlines():
    line=line.strip().removeprefix("export ")
    if not line or line.startswith("#") or "=" not in line:continue
    key,value=line.split("=",1)
    if key.strip() in {"APP_ACCESS_SESSION_SECRET","ADMIN_SESSION_SECRET"}:
        parts=shlex.split(value,comments=True)
        values[key.strip()]=parts[0] if parts else ""
if "APP_ACCESS_SESSION_SECRET" in values:
    existing=values["APP_ACCESS_SESSION_SECRET"]
    if len(existing)<32 or existing==values.get("ADMIN_SESSION_SECRET"):
        raise SystemExit("Existing app-access key is short or shared with admin. Provision an independent 32+ character key; no values displayed or changed.")
    print("Independent app-access signing key already configured. No values changed.")
    raise SystemExit(0)
fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_NOFOLLOW)
with os.fdopen(fd, "a") as stream:
    stream.write("\nAPP_ACCESS_SESSION_SECRET=" + secrets.token_hex(32) + "\n")
print("Independent app-access signing key configured. Existing admin key retained. App-access users must sign in again after restart.")
