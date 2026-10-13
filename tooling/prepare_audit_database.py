#!/usr/bin/env python3
"""Create a new isolated audit fixture from the current schema; never migrate live data."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import tempfile

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", required=True, help="new absolute arvo-audit-*.db path outside this app")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    raw = Path(args.database)
    if not raw.is_absolute():
        raise SystemExit("Use an absolute fixture path.")
    target = raw.resolve()
    marker = target.with_suffix(".audit-fixture.json")
    if not target.name.startswith("arvo-audit-") or target.suffix != ".db" or target.is_relative_to(root):
        raise SystemExit("Use a new arvo-audit-*.db outside the application directory.")
    if target.exists() or marker.exists():
        raise SystemExit("Fixture path already exists; stopped without modifying it.")
    target.parent.mkdir(parents=True, exist_ok=True)
    environment = os.environ.copy()
    environment["DATABASE_URL"] = "file:" + str(target)
    command = [str(root / "node_modules/.bin/prisma"), "migrate", "diff",
               "--from-empty", "--to-schema", str(root / "prisma/schema.prisma"), "--script"]
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, check=True)
    # dotenv may emit informational stdout before Prisma's SQL output.
    position = result.stdout.find("-- CreateTable")
    if position < 0:
        raise SystemExit("Expected schema-creation SQL was not returned; no fixture created.")
    sql = result.stdout[position:]
    schema = root / "prisma/schema.prisma"
    expected = set(re.findall(r"^model\s+(\w+)\s*\{", schema.read_text(), re.M))
    fd, temporary_name = tempfile.mkstemp(prefix=".arvo-audit-", suffix=".db", dir=target.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        with sqlite3.connect(temporary) as connection:
            connection.executescript(sql)
            actual = {row[0] for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
            if actual != expected:
                raise SystemExit("Fixture tables do not match this schema; stopped.")
        # Atomic no-overwrite publication. Existing databases cannot be replaced.
        os.link(temporary, target)
        with marker.open("x") as output:
            json.dump({"kind": "ARVO_EMPTY_AUDIT_FIXTURE", "database": str(target),
                       "schemaSha256": hashlib.sha256(schema.read_bytes()).hexdigest(),
                       "tables": sorted(actual)}, output, indent=2)
            output.write("\n")
        marker.chmod(0o600)
    finally:
        temporary.unlink(missing_ok=True)
    print("Created isolated audit fixture:", target)
    print("Tables:", len(expected))
    print("No production database, migrations, services or chain state changed.")

if __name__ == "__main__":
    main()
