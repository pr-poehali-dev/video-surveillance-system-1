import os
import json
import hmac
import time
import base64
import hashlib
from typing import Any, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p76735805_video_surveillance_s'
TOKEN_TTL = 24 * 3600

CORS_ORIGIN = {'Access-Control-Allow-Origin': '*'}


def _secret() -> bytes:
    custom = os.environ.get('AUTH_TOKEN_SECRET')
    if custom:
        return custom.encode()
    return hashlib.sha256(('esvn-auth:' + os.environ['DATABASE_URL']).encode()).digest()


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))


def issue_token(user_id: int, ttl: int = TOKEN_TTL) -> str:
    payload = _b64(json.dumps({'uid': int(user_id), 'exp': int(time.time()) + ttl}).encode())
    sig = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
    return f'{payload}.{sig}'


def _read_token(event: Dict[str, Any]) -> str:
    headers = {str(k).lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token') or ''
    if not token:
        auth = headers.get('x-authorization') or ''
        if auth.lower().startswith('bearer '):
            token = auth[7:]
    return str(token).strip()


def verify_token(token: str) -> Optional[int]:
    try:
        payload, sig = token.split('.')
        expected = _b64(hmac.new(_secret(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(_unb64(payload))
        if int(data['exp']) < time.time():
            return None
        return int(data['uid'])
    except Exception:
        return None


def _connect():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


_CTX_CACHE: Dict[int, Any] = {}
CTX_TTL = 20


def load_context(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    uid = verify_token(_read_token(event))
    if not uid:
        return None
    hit = _CTX_CACHE.get(uid)
    if hit and time.time() - hit[0] < CTX_TTL:
        return hit[1]
    ctx = _load_context_db(uid)
    if ctx:
        if len(_CTX_CACHE) > 500:
            _CTX_CACHE.clear()
        _CTX_CACHE[uid] = (time.time(), ctx)
    return ctx


def _load_context_db(uid: int) -> Optional[Dict[str, Any]]:
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute(
            f'''SELECT u.id, u.role_id, u.camera_group_id, r.permissions
                FROM {SCHEMA}.system_users u
                LEFT JOIN {SCHEMA}.roles r ON r.id = u.role_id
                WHERE u.id = %s''',
            (uid,)
        )
        row = cur.fetchone()
        cur.close()
    finally:
        conn.close()
    if not row:
        return None
    perms = row['permissions'] if isinstance(row['permissions'], dict) else {}
    return {
        'uid': row['id'],
        'role_id': row['role_id'],
        'camera_group_id': row['camera_group_id'],
        'perms': perms,
    }


def has_perm(ctx: Dict[str, Any], path: str) -> bool:
    cur: Any = ctx.get('perms') or {}
    for key in path.split('.'):
        if not isinstance(cur, dict):
            return False
        cur = cur.get(key)
    return cur is True


def perms_subset(candidate: Any, granted: Any) -> bool:
    if isinstance(candidate, dict):
        for key, value in candidate.items():
            sub = granted.get(key) if isinstance(granted, dict) else None
            if not perms_subset(value, sub):
                return False
        return True
    return candidate is not True or granted is True


def sanitize_permissions(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): sanitize_permissions(v) for k, v in value.items()}
    return value is True


def get_role_permissions(role_id: Any) -> Optional[Dict[str, Any]]:
    if role_id is None or not str(role_id).isdigit():
        return None
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute(f'SELECT permissions FROM {SCHEMA}.roles WHERE id = %s', (int(role_id),))
        row = cur.fetchone()
        cur.close()
    finally:
        conn.close()
    if not row:
        return None
    return row['permissions'] if isinstance(row['permissions'], dict) else {}


def get_user_role_permissions(user_id: Any) -> Optional[Dict[str, Any]]:
    if user_id is None or not str(user_id).isdigit():
        return None
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute(
            f'''SELECT r.permissions FROM {SCHEMA}.system_users u
                LEFT JOIN {SCHEMA}.roles r ON r.id = u.role_id WHERE u.id = %s''',
            (int(user_id),)
        )
        row = cur.fetchone()
        cur.close()
    finally:
        conn.close()
    if not row:
        return None
    return row['permissions'] if isinstance(row['permissions'], dict) else {}


def camera_in_group(camera_id: Any, group_id: Any) -> bool:
    if not str(camera_id).isdigit() or group_id is None:
        return False
    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute(
            f'SELECT 1 FROM {SCHEMA}.camera_groups WHERE id = %s AND %s = ANY(camera_ids)',
            (group_id, int(camera_id))
        )
        found = cur.fetchone() is not None
        cur.close()
    finally:
        conn.close()
    return found


def reply(status: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', **CORS_ORIGIN},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False,
    }


def unauthorized() -> Dict[str, Any]:
    return reply(401, 'Требуется авторизация')


def forbidden(message: str = 'Недостаточно прав для этого действия') -> Dict[str, Any]:
    return reply(403, message)
