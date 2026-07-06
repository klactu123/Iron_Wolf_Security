# Student folders

This folder holds one subfolder per student, created automatically in each student's
name — a home for their saved projects and progress. It starts empty (just this file).

## How folders get created

Launch with **`start_trainer.bat`** / **`start_trainer_hidden.vbs`** (or `python
server.py`). The first time the app opens with no students, it shows a **Welcome**
screen asking for a name. When a student enters their name:

- a folder `students/<Name>/` is created here, and
- everything they do — progress, code for each lesson, and tutor chat — saves
  automatically to `students/<Name>/progress.json` as they go.

To add more students later, click **👤 ＋** in the top bar and type a name (each gets
its own folder). Switch between them with the 👤 dropdown. **🗑** removes a student and
their folder — deleting the last one returns to the Welcome screen.

## File-only mode (no server)

If you open `python_trainer.html` directly as a file instead of running the server,
the browser **cannot** write to these folders (browser security). Profiles are then
kept in the browser, and you move work to/from real files with **⭳ Export** /
**⭱ Import** (keep each student's exported `.json` in their folder here).
