#!/usr/bin/env python3
"""
EmotionBlox - servidor local (solo biblioteca estandar de Python, sin instalar nada).

  python server.py            -> http://localhost:8000
  python server.py --reset    -> borra la base de datos y vuelve a crear los datos de ejemplo

Sirve la carpeta web/ y una API JSON con SQLite (data/emotionblox.db).
IMPORTANTE: los correos son SIMULADOS. Nunca se envia un correo real: el contenido del "correo"
se devuelve a la app (que lo muestra en una bandeja simulada) y se imprime en esta consola.
"""
import hashlib
import hmac
import json
import os
import random
import re
import secrets
import sqlite3
import sys
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

BASE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(BASE, "web")
DATA = os.path.join(BASE, "data")
DB_PATH = os.path.join(DATA, "emotionblox.db")
PORT = int(os.environ.get("PORT", "8000"))

# Credenciales de DEMOSTRACION del administrador (ver README.md). Cambiar antes de un uso real.
ADMIN_EMAIL = "admin@emotionblox.test"
ADMIN_PASSWORD = "Admin2026!"

TOTAL_MODULES = 4
EMOTIONS = ["alegre", "triste", "enojado", "asustado"]
CHECKIN_EMOTIONS = ["alegre", "triste", "enojado", "asustado", "tranquilo"]
MODULE_EMOTION = {1: "alegre", 2: "triste", 3: "enojado", 4: "asustado"}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".txt": "text/plain; charset=utf-8",
}


def now():
    return int(time.time())


def db():
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


SCHEMA = """
CREATE TABLE IF NOT EXISTS children(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0,
  progress TEXT NOT NULL DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 0,
  current_module INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  last_active INTEGER NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS attempts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  module INTEGER NOT NULL,
  qid TEXT NOT NULL,
  emotion TEXT NOT NULL,
  correct INTEGER NOT NULL,
  tries INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS checkins(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  emotion TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS codes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code TEXT NOT NULL,
  expires INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  child_id INTEGER
);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admins(
  email TEXT PRIMARY KEY,
  salt TEXT NOT NULL,
  hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_child ON attempts(child_id);
CREATE INDEX IF NOT EXISTS idx_checkins_child ON checkins(child_id);
CREATE INDEX IF NOT EXISTS idx_children_email ON children(parent_email);
"""


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 120_000).hex()


def init_db(reset=False):
    os.makedirs(DATA, exist_ok=True)
    if reset and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    con = db()
    con.executescript(SCHEMA)
    row = con.execute("SELECT COUNT(*) c FROM admins").fetchone()
    if row["c"] == 0:
        salt = secrets.token_hex(16)
        con.execute("INSERT INTO admins(email, salt, hash) VALUES(?,?,?)",
                    (ADMIN_EMAIL, salt, hash_password(ADMIN_PASSWORD, salt)))
    if con.execute("SELECT COUNT(*) c FROM children").fetchone()["c"] == 0:
        seed_demo(con)
    con.commit()
    con.close()


def seed_demo(con):
    """12 ninos de EJEMPLO (marcados is_demo) para poder probar los portales."""
    rnd = random.Random(7)
    chars = ["bloki", "soli", "nami", "brasa", "luma"]
    people = [
        ("Mateo", "familia.demo@ejemplo.test", 3), ("Sofía", "familia.demo@ejemplo.test", 2),
        ("Valentina", "padre01@ejemplo.test", 4), ("Santiago", "padre02@ejemplo.test", 1),
        ("Emilia", "padre03@ejemplo.test", 4), ("Lucas", "padre04@ejemplo.test", 2),
        ("Camila", "padre05@ejemplo.test", 3), ("Thiago", "padre06@ejemplo.test", 1),
        ("Isabella", "padre07@ejemplo.test", 2), ("Dylan", "padre08@ejemplo.test", 1),
        ("Renata", "padre09@ejemplo.test", 3), ("Samuel", "padre10@ejemplo.test", 4),
    ]
    t_now = now()
    for name, email, module in people:
        done = module - 1 if rnd.random() < 0.85 else module
        done = max(0, min(TOTAL_MODULES, done))
        modules = {}
        points = 0
        for m in range(1, done + 1):
            stars = rnd.choice([2, 3, 3, 1])
            modules[str(m)] = {"done": True, "stars": stars}
            points += 20 + stars * 5
        unlocked = ["bloki"] + chars[1:1 + done]
        progress = {
            "character": "bloki", "points": points, "streak": rnd.randint(1, 5),
            "currentModule": min(TOTAL_MODULES, done + 1), "modules": modules,
            "unlocked": unlocked, "stickers": [f"m{m}" for m in range(1, done + 1)],
            "badges": ["primera"] if done else [], "checkins": 0,
        }
        created = t_now - rnd.randint(2, 20) * 86400
        last = t_now - rnd.randint(0, 6) * 86400 - rnd.randint(0, 40000)
        cur = con.execute(
            "INSERT INTO children(name,parent_email,confirmed,progress,points,current_module,created_at,last_active,is_demo)"
            " VALUES(?,?,?,?,?,?,?,?,1)",
            (name, email, 1, json.dumps(progress), points, progress["currentModule"], created, last))
        cid = cur.lastrowid
        for m in range(1, done + 1):
            for q in range(1, 4):
                first = rnd.random() < 0.72
                t = last - rnd.randint(0, 5) * 86400 - rnd.randint(0, 3000)
                con.execute("INSERT INTO attempts(child_id,module,qid,emotion,correct,tries,created_at) VALUES(?,?,?,?,?,?,?)",
                            (cid, m, f"m{m}q{q}", MODULE_EMOTION[m], 1, 1 if first else 2, t))
        for _ in range(rnd.randint(2, 6)):
            con.execute("INSERT INTO checkins(child_id,emotion,created_at) VALUES(?,?,?)",
                        (cid, rnd.choice(CHECKIN_EMOTIONS), t_now - rnd.randint(0, 6) * 86400 - rnd.randint(0, 40000)))


# ----------------------------------------------------------------------------
# Utilidades
# ----------------------------------------------------------------------------
class ApiError(Exception):
    def __init__(self, status, message, field=None):
        super().__init__(message)
        self.status = status
        self.message = message
        self.field = field


def norm_email(s):
    return (s or "").strip().lower()


def mask_email(e):
    user, _, dom = e.partition("@")
    return (user[:1] + "***@" + dom) if user else e


def simulated_mail(to, subject, body, code=None):
    mail = {"simulated": True, "to": to, "subject": subject, "body": body, "code": code}
    print(f"\n--- CORREO SIMULADO (no se envia) ---\nPara: {to}\nAsunto: {subject}\n{body}\n-------------------------------------\n",
          flush=True)
    return mail


def issue_code(con, email, purpose, child_id=None):
    con.execute("UPDATE codes SET used=1 WHERE email=? AND purpose=? AND used=0", (email, purpose))
    code = f"{secrets.randbelow(1_000_000):06d}"
    con.execute("INSERT INTO codes(email,purpose,code,expires,child_id) VALUES(?,?,?,?,?)",
                (email, purpose, code, now() + 600, child_id))
    return code


def check_code(con, email, purpose, code):
    row = con.execute("SELECT * FROM codes WHERE email=? AND purpose=? AND used=0 ORDER BY id DESC LIMIT 1",
                      (email, purpose)).fetchone()
    if not row:
        raise ApiError(400, "Primero pide un código nuevo.", "code")
    if row["expires"] < now():
        raise ApiError(400, "Este código ya venció. Pide uno nuevo.", "code")
    if row["attempts"] >= 5:
        raise ApiError(429, "Demasiados intentos. Pide un código nuevo.", "code")
    if not hmac.compare_digest(row["code"], (code or "").strip()):
        con.execute("UPDATE codes SET attempts=attempts+1 WHERE id=?", (row["id"],))
        con.commit()
        raise ApiError(400, "Ese código no es correcto. Revisa el correo e inténtalo otra vez.", "code")
    con.execute("UPDATE codes SET used=1 WHERE id=?", (row["id"],))
    return row


def new_session(con, role, email, ttl=7200):
    token = secrets.token_urlsafe(24)
    con.execute("INSERT INTO sessions(token,role,email,expires) VALUES(?,?,?,?)", (token, role, email, now() + ttl))
    return token


def require_session(con, headers, role):
    auth = headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    row = con.execute("SELECT * FROM sessions WHERE token=? AND role=? AND expires>?", (token, role, now())).fetchone()
    if not row:
        raise ApiError(401, "Tu sesión terminó. Entra de nuevo.")
    return row


LOGIN_FAILS = {}


def child_public(r):
    prog = json.loads(r["progress"] or "{}")
    return {"id": r["id"], "name": r["name"], "confirmed": bool(r["confirmed"]), "progress": prog}


def child_summary(r):
    prog = json.loads(r["progress"] or "{}")
    return {"id": r["id"], "name": r["name"], "character": prog.get("character", "bloki"),
            "points": r["points"], "currentModule": r["current_module"], "confirmed": bool(r["confirmed"]),
            "modulesDone": sum(1 for m in (prog.get("modules") or {}).values() if m.get("done"))}


def get_child(con, cid):
    r = con.execute("SELECT * FROM children WHERE id=?", (cid,)).fetchone()
    if not r:
        raise ApiError(404, "No encontramos esa aventura.")
    return r


def child_report(con, r):
    cid = r["id"]
    prog = json.loads(r["progress"] or "{}")
    per = {e: {"total": 0, "first": 0} for e in EMOTIONS}
    for row in con.execute("SELECT emotion, COUNT(*) total, SUM(CASE WHEN correct=1 AND tries=1 THEN 1 ELSE 0 END) first "
                           "FROM attempts WHERE child_id=? GROUP BY emotion", (cid,)):
        if row["emotion"] in per:
            per[row["emotion"]] = {"total": row["total"], "first": row["first"] or 0}
    since = now() - 7 * 86400
    checks = {e: 0 for e in CHECKIN_EMOTIONS}
    for row in con.execute("SELECT emotion, COUNT(*) c FROM checkins WHERE child_id=? AND created_at>=? GROUP BY emotion", (cid, since)):
        if row["emotion"] in checks:
            checks[row["emotion"]] = row["c"]
    days = {}
    for i in range(6, -1, -1):
        d = datetime.fromtimestamp(now() - i * 86400).strftime("%Y-%m-%d")
        days[d] = 0
    for tbl in ("attempts", "checkins"):
        for row in con.execute(f"SELECT created_at FROM {tbl} WHERE child_id=? AND created_at>=?", (cid, since - 86400)):
            d = datetime.fromtimestamp(row["created_at"]).strftime("%Y-%m-%d")
            if d in days:
                days[d] += 1
    return {
        "child": child_summary(r), "perEmotion": per, "checkins": checks,
        "activity": [{"date": d, "count": c} for d, c in days.items()],
        "modules": prog.get("modules", {}), "points": r["points"], "streak": prog.get("streak", 0),
        "totalModules": TOTAL_MODULES, "lastActive": r["last_active"],
    }


# ----------------------------------------------------------------------------
# Rutas
# ----------------------------------------------------------------------------
def api_create_child(con, body, headers, params):
    name = (body.get("name") or "").strip()
    email = norm_email(body.get("parentEmail"))
    if not name:
        raise ApiError(400, "Escribe tu nombre para seguir.", "name")
    if len(name) > 30:
        raise ApiError(400, "El nombre es muy largo. Usa 30 letras o menos.", "name")
    if not email:
        raise ApiError(400, "Un adulto debe escribir su correo.", "parentEmail")
    if not EMAIL_RE.match(email):
        raise ApiError(400, "Ese correo no parece correcto. Debe verse como nombre@correo.com", "parentEmail")
    t = now()
    cur = con.execute("INSERT INTO children(name,parent_email,confirmed,progress,created_at,last_active) VALUES(?,?,0,'{}',?,?)",
                      (name, email, t, t))
    cid = cur.lastrowid
    code = issue_code(con, email, "confirm", cid)
    mail = simulated_mail(email, "Confirma la aventura de " + name + " en EmotionBlox",
                          f"Hola. {name} quiere empezar su aventura en EmotionBlox.\nTu código de confirmación es: {code}\n"
                          "Vale por 10 minutos. Si no fuiste tú, ignora este mensaje.", code)
    return 201, {"child": child_public(get_child(con, cid)), "mail": mail}


def api_confirm_child(con, body, headers, params):
    r = get_child(con, int(params["id"]))
    check_code(con, r["parent_email"], "confirm", body.get("code"))
    con.execute("UPDATE children SET confirmed=1 WHERE id=?", (r["id"],))
    return 200, {"child": child_public(get_child(con, r["id"]))}


def api_resend_child(con, body, headers, params):
    r = get_child(con, int(params["id"]))
    code = issue_code(con, r["parent_email"], "confirm", r["id"])
    mail = simulated_mail(r["parent_email"], "Tu nuevo código de EmotionBlox",
                          f"Tu nuevo código de confirmación es: {code}", code)
    return 200, {"mail": mail}


def api_get_child(con, body, headers, params):
    return 200, {"child": child_public(get_child(con, int(params["id"])))}


def api_list_children(con, body, headers, params):
    ids = [int(x) for x in re.findall(r"\d+", params.get("ids", ""))][:12]
    if not ids:
        return 200, {"children": []}
    q = ",".join("?" * len(ids))
    rows = con.execute(f"SELECT * FROM children WHERE id IN ({q}) AND confirmed=1", ids).fetchall()
    return 200, {"children": [child_summary(r) for r in rows]}


def api_put_progress(con, body, headers, params):
    r = get_child(con, int(params["id"]))
    prog = body.get("progress")
    if not isinstance(prog, dict) or len(json.dumps(prog)) > 60_000:
        raise ApiError(400, "No pudimos guardar tu avance.")
    points = int(prog.get("points", 0) or 0)
    cur_mod = max(1, min(TOTAL_MODULES, int(prog.get("currentModule", 1) or 1)))
    con.execute("UPDATE children SET progress=?, points=?, current_module=?, last_active=? WHERE id=?",
                (json.dumps(prog), points, cur_mod, now(), r["id"]))
    return 200, {"saved": True}


def api_attempt(con, body, headers, params):
    r = get_child(con, int(params["id"]))
    module = int(body.get("module", 1))
    emotion = body.get("emotion") if body.get("emotion") in EMOTIONS else MODULE_EMOTION.get(module, "alegre")
    con.execute("INSERT INTO attempts(child_id,module,qid,emotion,correct,tries,created_at) VALUES(?,?,?,?,?,?,?)",
                (r["id"], module, str(body.get("qid", ""))[:20], emotion, 1 if body.get("correct") else 0,
                 max(1, int(body.get("tries", 1))), now()))
    con.execute("UPDATE children SET last_active=? WHERE id=?", (now(), r["id"]))
    return 201, {"saved": True}


def api_checkin(con, body, headers, params):
    r = get_child(con, int(params["id"]))
    emotion = body.get("emotion")
    if emotion not in CHECKIN_EMOTIONS:
        raise ApiError(400, "Elige una cara para seguir.")
    con.execute("INSERT INTO checkins(child_id,emotion,created_at) VALUES(?,?,?)", (r["id"], emotion, now()))
    con.execute("UPDATE children SET last_active=? WHERE id=?", (now(), r["id"]))
    return 201, {"saved": True}


# ---- Padre / madre -----------------------------------------------------------
def api_parent_hints(con, body, headers, params):
    ids = [int(x) for x in re.findall(r"\d+", params.get("ids", ""))][:12]
    if not ids:
        return 200, {"hints": []}
    q = ",".join("?" * len(ids))
    rows = con.execute(f"SELECT DISTINCT parent_email FROM children WHERE id IN ({q}) AND confirmed=1", ids).fetchall()
    return 200, {"hints": [mask_email(r["parent_email"]) for r in rows]}


def api_parent_request(con, body, headers, params):
    email = norm_email(body.get("email"))
    if not email:
        raise ApiError(400, "Escribe el correo que usaste al crear la aventura.", "email")
    if not EMAIL_RE.match(email):
        raise ApiError(400, "Ese correo no parece correcto. Debe verse como nombre@correo.com", "email")
    n = con.execute("SELECT COUNT(*) c FROM children WHERE parent_email=? AND confirmed=1", (email,)).fetchone()["c"]
    if n == 0:
        raise ApiError(404, "No encontramos aventuras con ese correo. Revisa que esté bien escrito.", "email")
    code = issue_code(con, email, "parent")
    mail = simulated_mail(email, "Tu código para entrar a EmotionBlox",
                          f"Tu código de acceso es: {code}\nVale por 10 minutos.", code)
    return 200, {"mail": mail}


def api_parent_verify(con, body, headers, params):
    email = norm_email(body.get("email"))
    check_code(con, email, "parent", body.get("code"))
    token = new_session(con, "parent", email)
    return 200, {"token": token}


def api_parent_children(con, body, headers, params):
    s = require_session(con, headers, "parent")
    rows = con.execute("SELECT * FROM children WHERE parent_email=? AND confirmed=1 ORDER BY id", (s["email"],)).fetchall()
    return 200, {"email": s["email"], "children": [child_summary(r) for r in rows]}


def api_parent_report(con, body, headers, params):
    s = require_session(con, headers, "parent")
    r = get_child(con, int(params["id"]))
    if r["parent_email"] != s["email"]:
        raise ApiError(403, "Esa aventura no pertenece a este correo.")
    return 200, child_report(con, r)


# ---- Administrador -----------------------------------------------------------
def api_admin_login(con, body, headers, params):
    email = norm_email(body.get("email"))
    password = body.get("password") or ""
    if not email or not password:
        raise ApiError(400, "Escribe tu correo y tu contraseña.", "email" if not email else "password")
    fails = LOGIN_FAILS.get(email, (0, 0))
    if fails[0] >= 5 and fails[1] > now():
        raise ApiError(429, "Demasiados intentos. Espera un minuto e inténtalo otra vez.")
    row = con.execute("SELECT * FROM admins WHERE email=?", (email,)).fetchone()
    ok = bool(row) and hmac.compare_digest(row["hash"], hash_password(password, row["salt"]))
    if not ok:
        LOGIN_FAILS[email] = (fails[0] + 1, now() + 60)
        raise ApiError(401, "Correo o contraseña incorrectos. Revisa los datos o usa “¿Olvidaste tu contraseña?”.", "password")
    LOGIN_FAILS.pop(email, None)
    return 200, {"token": new_session(con, "admin", email), "email": email}


def api_admin_forgot(con, body, headers, params):
    email = norm_email(body.get("email"))
    if not EMAIL_RE.match(email):
        raise ApiError(400, "Escribe un correo válido.", "email")
    mail = None
    if con.execute("SELECT 1 FROM admins WHERE email=?", (email,)).fetchone():
        code = issue_code(con, email, "admin-reset")
        mail = simulated_mail(email, "Recupera tu contraseña de EmotionBlox",
                              f"Tu código para crear una contraseña nueva es: {code}\nVale por 10 minutos.", code)
    # Respuesta igual exista o no el correo, para no revelar quien es administrador.
    return 200, {"message": "Si ese correo es de un administrador, te enviamos un código.", "mail": mail}


def api_admin_reset(con, body, headers, params):
    email = norm_email(body.get("email"))
    password = body.get("password") or ""
    if len(password) < 8:
        raise ApiError(400, "La contraseña nueva debe tener al menos 8 caracteres.", "password")
    check_code(con, email, "admin-reset", body.get("code"))
    salt = secrets.token_hex(16)
    con.execute("UPDATE admins SET salt=?, hash=? WHERE email=?", (salt, hash_password(password, salt), email))
    return 200, {"ok": True}


def api_admin_summary(con, body, headers, params):
    require_session(con, headers, "admin")
    total = con.execute("SELECT COUNT(*) c FROM children").fetchone()["c"]
    active = con.execute("SELECT COUNT(*) c FROM children WHERE last_active>=?", (now() - 7 * 86400,)).fetchone()["c"]
    done = con.execute("SELECT COUNT(*) c FROM children WHERE current_module>=? AND progress LIKE '%\"4\": {\"done\": true%'",
                       (TOTAL_MODULES,)).fetchone()["c"]
    avg = con.execute("SELECT AVG(points) a FROM children").fetchone()["a"] or 0
    return 200, {"total": total, "active": active, "completed": done, "avgPoints": round(avg), "totalModules": TOTAL_MODULES}


SORTS = {"name": "name COLLATE NOCASE", "email": "parent_email", "module": "current_module",
         "points": "points", "last": "last_active"}


def api_admin_children(con, body, headers, params):
    require_session(con, headers, "admin")
    q = (params.get("q") or "").strip().lower()
    module = params.get("module") or ""
    sort = SORTS.get(params.get("sort"), "last_active")
    direction = "ASC" if params.get("dir") == "asc" else "DESC"
    page = max(1, int(params.get("page") or 1))
    size = max(1, min(50, int(params.get("size") or 5)))
    where, args = [], []
    if q:
        where.append("(LOWER(name) LIKE ? OR LOWER(parent_email) LIKE ?)")
        args += [f"%{q}%", f"%{q}%"]
    if module.isdigit():
        where.append("current_module=?")
        args.append(int(module))
    w = ("WHERE " + " AND ".join(where)) if where else ""
    total = con.execute(f"SELECT COUNT(*) c FROM children {w}", args).fetchone()["c"]
    rows = con.execute(f"SELECT * FROM children {w} ORDER BY {sort} {direction}, id LIMIT ? OFFSET ?",
                       args + [size, (page - 1) * size]).fetchall()
    out = []
    for r in rows:
        s = child_summary(r)
        s.update({"email": r["parent_email"], "lastActive": r["last_active"], "demo": bool(r["is_demo"])})
        out.append(s)
    return 200, {"children": out, "total": total, "page": page, "size": size, "totalModules": TOTAL_MODULES}


def api_admin_delete(con, body, headers, params):
    require_session(con, headers, "admin")
    r = get_child(con, int(params["id"]))
    for tbl in ("attempts", "checkins"):
        con.execute(f"DELETE FROM {tbl} WHERE child_id=?", (r["id"],))
    con.execute("DELETE FROM children WHERE id=?", (r["id"],))
    return 200, {"deleted": True}


def api_logout(con, body, headers, params):
    auth = headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        con.execute("DELETE FROM sessions WHERE token=?", (auth[7:],))
    return 200, {"ok": True}


ROUTES = [
    ("POST", r"^/api/children$", api_create_child),
    ("GET", r"^/api/children$", api_list_children),
    ("GET", r"^/api/children/(?P<id>\d+)$", api_get_child),
    ("POST", r"^/api/children/(?P<id>\d+)/confirm$", api_confirm_child),
    ("POST", r"^/api/children/(?P<id>\d+)/resend$", api_resend_child),
    ("PUT", r"^/api/children/(?P<id>\d+)/progress$", api_put_progress),
    ("POST", r"^/api/children/(?P<id>\d+)/attempt$", api_attempt),
    ("POST", r"^/api/children/(?P<id>\d+)/checkin$", api_checkin),
    ("GET", r"^/api/parent/hints$", api_parent_hints),
    ("POST", r"^/api/parent/request-code$", api_parent_request),
    ("POST", r"^/api/parent/verify$", api_parent_verify),
    ("GET", r"^/api/parent/children$", api_parent_children),
    ("GET", r"^/api/parent/children/(?P<id>\d+)/report$", api_parent_report),
    ("POST", r"^/api/admin/login$", api_admin_login),
    ("POST", r"^/api/admin/forgot$", api_admin_forgot),
    ("POST", r"^/api/admin/reset$", api_admin_reset),
    ("GET", r"^/api/admin/summary$", api_admin_summary),
    ("GET", r"^/api/admin/children$", api_admin_children),
    ("DELETE", r"^/api/admin/children/(?P<id>\d+)$", api_admin_delete),
    ("POST", r"^/api/logout$", api_logout),
]
ROUTES = [(m, re.compile(p), f) for m, p, f in ROUTES]


class Handler(BaseHTTPRequestHandler):
    server_version = "EmotionBlox/1.0"

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""):
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, status, payload, ctype="application/json; charset=utf-8", raw=False):
        data = payload if raw else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store" if not raw else "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def _api(self, method, parsed):
        path = parsed.path
        params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
        for m, rx, fn in ROUTES:
            if m != method:
                continue
            mt = rx.match(path)
            if not mt:
                continue
            body = {}
            if method in ("POST", "PUT"):
                n = int(self.headers.get("Content-Length") or 0)
                if n > 100_000:
                    return self._send(413, {"error": "Mensaje demasiado grande."})
                if n:
                    try:
                        body = json.loads(self.rfile.read(n).decode("utf-8"))
                    except Exception:
                        return self._send(400, {"error": "Mensaje no válido."})
            p = dict(params)
            p.update(mt.groupdict())
            con = db()
            try:
                status, out = fn(con, body, self.headers, p)
                con.commit()
                return self._send(status, out)
            except ApiError as e:
                con.commit()
                return self._send(e.status, {"error": e.message, "field": e.field})
            except Exception as e:  # noqa
                con.rollback()
                sys.stderr.write(f"Error en {method} {path}: {e!r}\n")
                return self._send(500, {"error": "Algo salió mal en el servidor. Inténtalo otra vez."})
            finally:
                con.close()
        return self._send(404, {"error": "No encontrado."})

    def _static(self, parsed):
        rel = unquote(parsed.path).lstrip("/") or "index.html"
        full = os.path.normpath(os.path.join(WEB, rel))
        if not full.startswith(WEB):
            return self._send(403, b"Prohibido", "text/plain; charset=utf-8", raw=True)
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not os.path.isfile(full):
            full = os.path.join(WEB, "index.html")  # la app maneja sus propias rutas
        ext = os.path.splitext(full)[1].lower()
        with open(full, "rb") as f:
            data = f.read()
        self._send(200, data, MIME.get(ext, "application/octet-stream"), raw=True)

    def do_GET(self):
        p = urlparse(self.path)
        return self._api("GET", p) if p.path.startswith("/api/") else self._static(p)

    do_HEAD = do_GET

    def do_POST(self):
        self._api("POST", urlparse(self.path))

    def do_PUT(self):
        self._api("PUT", urlparse(self.path))

    def do_DELETE(self):
        self._api("DELETE", urlparse(self.path))


def main():
    init_db(reset="--reset" in sys.argv)
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"EmotionBlox listo en http://localhost:{PORT}  (Ctrl+C para detener)", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
