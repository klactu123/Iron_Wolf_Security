#!/usr/bin/env python3
"""Create a timestamped .zip backup of the whole project (including student work).

Usage:
    python tools/backup.py                 # zip into the parent folder
    python tools/backup.py --out D:\\backups  # choose a destination folder
    python tools/backup.py --keep 10       # keep only the 10 newest backups

By default the archive is written to the project's parent folder (outside the
project, so it isn't served by the server or nested in future backups) with a name
like  Interactive_Python_Trainer_backup_YYYYMMDD_HHMMSS.zip.

Includes everything in the project, incl. each student's students/<Name>/progress.json.
Skips: __pycache__, .git, .server.pid, and any existing backup archives.
No API keys are stored in files, so none are captured (they live in the
ANTHROPIC_API_KEY environment variable / the browser only).
"""

import argparse
import os
import time
import zipfile

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = os.path.basename(PROJECT)
PREFIX = NAME + "_backup_"
SKIP_DIRS = {"__pycache__", ".git"}
SKIP_FILES = {".server.pid", ".env"}   # .env holds the API key — never back it up


def is_backup(fname):
    return fname.startswith(PREFIX) and fname.endswith(".zip")


def collect_files():
    out = []
    for root, dirs, files in os.walk(PROJECT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f in SKIP_FILES or is_backup(f):
                continue
            out.append(os.path.join(root, f))
    return out


def prune(out_dir, keep):
    backups = sorted(
        (os.path.join(out_dir, f) for f in os.listdir(out_dir) if is_backup(f)),
        key=os.path.getmtime, reverse=True,
    )
    for old in backups[keep:]:
        try:
            os.remove(old)
            print("  pruned old backup: " + os.path.basename(old))
        except OSError:
            pass


def main():
    ap = argparse.ArgumentParser(description="Zip-backup the project.")
    ap.add_argument("--out", default=os.path.dirname(PROJECT),
                    help="destination folder (default: the project's parent folder)")
    ap.add_argument("--keep", type=int, default=None,
                    help="keep only the N newest backups in the destination")
    args = ap.parse_args()

    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)
    ts = time.strftime("%Y%m%d_%H%M%S")
    dst = os.path.join(out_dir, PREFIX + ts + ".zip")

    files = collect_files()
    parent = os.path.dirname(PROJECT)
    total = 0
    with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as z:
        for full in files:
            if os.path.abspath(full) == dst:      # never zip ourselves
                continue
            z.write(full, os.path.relpath(full, parent))  # keep top folder name
            total += os.path.getsize(full)

    print("Backup created:")
    print("  " + dst)
    print("  files: %d   uncompressed: %d bytes   zip: %d bytes"
          % (len(files), total, os.path.getsize(dst)))

    if args.keep is not None and args.keep > 0:
        prune(out_dir, args.keep)


if __name__ == "__main__":
    main()
