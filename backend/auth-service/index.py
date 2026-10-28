"""
Объединённый сервис авторизации: вход, сессии, вход под другим пользователем
Роутинг по query-параметру resource: auth | sessions | impersonate
"""

import json
import os
import hashlib
import hmac
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from auth_security import (
    SCHEMA, issue_token, load_context, has_perm, perms_subset,
    get_user_role_permissions, unauthorized, forbidden, reply
)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 200000).hex()
    return f'pbkdf2${salt}${digest}'


def verify_password(password: str, stored: str) -> bool:
    if stored and stored.startswith('pbkdf2$'):
        _, salt, digest = stored.split('$')
        calc = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 200000).hex()
        return hmac.compare_digest(calc, digest)
    legacy = hashlib.sha256(password.encode()).hexdigest()
    return hmac.compare_digest(legacy, stored or '')


def json_response(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body),
        'isBase64Encoded': False
    }


MAX_FAILS_PER_LOGIN = 8
MAX_FAILS_PER_IP = 40
LOCK_WINDOW = "15 minutes"


def client_ip(event: Dict[str, Any]) -> str:
    identity = (event.get('requestContext') or {}).get('identity') or {}
    return str(identity.get('sourceIp') or '')[:64]


def handle_auth(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Авторизация пользователя по логину и паролю, выдача подписанного токена"""
    if method != 'POST':
        return json_response(405, {'error': 'Метод не поддерживается'})

    try:
        body_data = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        body_data = {}
    login = str(body_data.get('login') or '').strip()
    password = str(body_data.get('password') or '').strip()

    if not login or not password:
        return json_response(400, {'error': 'Логин и пароль обязательны'})
    if len(login) > 100 or len(password) > 200:
        return json_response(400, {'error': 'Слишком длинные данные'})

    ip = client_ip(event)
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT
          (SELECT COUNT(*) FROM {SCHEMA}.login_attempts WHERE login = %s AND created_at > NOW() - INTERVAL '{LOCK_WINDOW}') AS by_login,
          (SELECT COUNT(*) FROM {SCHEMA}.login_attempts WHERE ip_address = %s AND created_at > NOW() - INTERVAL '{LOCK_WINDOW}') AS by_ip
    """, (login, ip))
    counts = cur.fetchone()
    if counts['by_login'] >= MAX_FAILS_PER_LOGIN or (ip and counts['by_ip'] >= MAX_FAILS_PER_IP):
        cur.close()
        conn.close()
        return json_response(429, {'error': 'Слишком много попыток входа. Повторите через 15 минут'})

    cur.execute("""
        SELECT id, full_name, email, login, role_id, user_group_id,
               camera_group_id, company, position, password_hash
        FROM t_p76735805_video_surveillance_s.system_users
        WHERE login = %s
    """, (login,))
    user = cur.fetchone()
    if user and not verify_password(password, user['password_hash']):
        user = None
    if not user:
        verify_password(password, 'pbkdf2$00$00')
        cur.execute(f"INSERT INTO {SCHEMA}.login_attempts (login, ip_address) VALUES (%s, %s)", (login, ip))
        cur.execute(f"DELETE FROM {SCHEMA}.login_attempts WHERE created_at < NOW() - INTERVAL '1 day'")
        conn.commit()
        cur.close()
        conn.close()
        return json_response(401, {'error': 'Некорректный логин и/или пароль'})

    cur.execute("""
        UPDATE t_p76735805_video_surveillance_s.system_users
        SET last_login = NOW(), is_online = true
        WHERE id = %s
    """, (user['id'],))
    if not user['password_hash'].startswith('pbkdf2$'):
        cur.execute("""
            UPDATE t_p76735805_video_surveillance_s.system_users SET password_hash = %s WHERE id = %s
        """, (hash_password(password), user['id']))
    cur.execute(f"DELETE FROM {SCHEMA}.login_attempts WHERE login = %s", (login,))
    conn.commit()

    cur.close()
    conn.close()

    safe_user = {k: v for k, v in user.items() if k != 'password_hash'}
    return json_response(200, {'success': True, 'user': safe_user, 'token': issue_token(user['id'])})


def handle_sessions(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Управление сессиями пользователей (только для авторизованных)"""
    ctx = load_context(event)
    if not ctx:
        return unauthorized()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            if not has_perm(ctx, 'parameters.access_management.sessions.view'):
                return forbidden()

            cur.execute("""
                SELECT
                    s.id,
                    s.user_id,
                    s.session_token,
                    s.ip_address,
                    s.user_agent,
                    s.current_route,
                    s.last_activity,
                    s.created_at,
                    u.full_name,
                    u.login,
                    u.email
                FROM t_p76735805_video_surveillance_s.user_sessions s
                JOIN t_p76735805_video_surveillance_s.system_users u ON s.user_id = u.id
                WHERE s.expires_at > NOW()
                ORDER BY s.last_activity DESC
            """)

            result = [dict(row) for row in cur.fetchall()]
            for session in result:
                if session.get('last_activity'):
                    session['last_activity'] = session['last_activity'].isoformat()
                if session.get('created_at'):
                    session['created_at'] = session['created_at'].isoformat()

            return json_response(200, result)

        elif method == 'POST':
            try:
                body_data = json.loads(event.get('body') or '{}')
            except json.JSONDecodeError:
                body_data = {}

            session_token = str(body_data.get('session_token') or '')[:200]
            user_agent = str(body_data.get('user_agent') or '')[:500]
            current_route = str(body_data.get('current_route') or '/')[:300]
            ip_address = client_ip(event)

            if not session_token:
                return json_response(400, {'error': 'session_token обязателен'})

            claimed = body_data.get('user_id')
            if claimed is not None and str(claimed) != str(ctx['uid']):
                return forbidden()

            cur.execute("SELECT id, user_id FROM t_p76735805_video_surveillance_s.user_sessions WHERE session_token = %s", (session_token,))
            existing = cur.fetchone()

            if existing:
                if existing['user_id'] != ctx['uid']:
                    return forbidden()
                cur.execute("""
                    UPDATE t_p76735805_video_surveillance_s.user_sessions
                    SET current_route = %s,
                        last_activity = NOW(),
                        expires_at = NOW() + INTERVAL '24 hours'
                    WHERE session_token = %s
                    RETURNING id
                """, (current_route, session_token))
            else:
                cur.execute("""
                    INSERT INTO t_p76735805_video_surveillance_s.user_sessions
                    (user_id, session_token, ip_address, user_agent, current_route, expires_at)
                    VALUES (%s, %s, %s, %s, %s, NOW() + INTERVAL '24 hours')
                    RETURNING id
                """, (ctx['uid'], session_token, ip_address, user_agent, current_route))
            session_id = cur.fetchone()['id']
            conn.commit()

            return json_response(200, {'success': True, 'session_id': session_id})

        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            session_token = params.get('session_token', '')

            if not session_token:
                return json_response(400, {'error': 'session_token обязателен'})

            cur.execute("SELECT user_id FROM t_p76735805_video_surveillance_s.user_sessions WHERE session_token = %s", (session_token,))
            row = cur.fetchone()
            if row and row['user_id'] != ctx['uid'] and not has_perm(ctx, 'parameters.access_management.sessions.view'):
                return forbidden()

            cur.execute("""
                UPDATE t_p76735805_video_surveillance_s.user_sessions
                SET expires_at = NOW() - INTERVAL '1 hour'
                WHERE session_token = %s
            """, (session_token,))
            conn.commit()

            return json_response(200, {'success': True})

        else:
            return json_response(405, {'error': 'Метод не поддерживается'})

    except Exception as e:
        print(f'sessions error: {e}')
        return json_response(500, {'error': 'Внутренняя ошибка сервера'})
    finally:
        cur.close()
        conn.close()


def handle_impersonate(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Вход за другого пользователя: только при праве редактировать пользователей и не выше своих прав"""
    if method != 'GET':
        return json_response(405, {'error': 'Method not allowed'})

    ctx = load_context(event)
    if not ctx:
        return unauthorized()
    if not has_perm(ctx, 'parameters.access_management.users.edit'):
        return forbidden()

    query_params = event.get('queryStringParameters') or {}
    user_id = query_params.get('user_id')
    if not user_id or not str(user_id).isdigit():
        return json_response(400, {'error': 'user_id is required'})

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("""
        SELECT id, login, full_name, role_id, user_group_id, camera_group_id
        FROM t_p76735805_video_surveillance_s.system_users
        WHERE id = %s
    """, (int(user_id),))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return json_response(404, {'error': 'User not found'})

    target_perms = get_user_role_permissions(row[0]) or {}
    if not perms_subset(target_perms, ctx['perms']):
        return forbidden('Нельзя войти за пользователя с более широкими правами')

    return json_response(200, {
        'login': row[1],
        'full_name': row[2],
        'role_id': row[3],
        'user_group_id': row[4],
        'camera_group_id': row[5],
        'user_id': row[0],
        'token': issue_token(row[0], 3600)
    })


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Объединённый сервис: авторизация, сессии, имперсонация
    Args: event - dict с httpMethod, body, queryStringParameters (resource=auth|sessions|impersonate)
          context - объект с request_id
    Returns: HTTP response dict
    """
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': '',
            'isBase64Encoded': False
        }

    query_params = event.get('queryStringParameters') or {}
    resource = query_params.get('resource', 'auth')

    try:
        if resource == 'auth':
            return handle_auth(event, method)
        elif resource == 'sessions':
            return handle_sessions(event, method)
        elif resource == 'impersonate':
            return handle_impersonate(event, method)
        else:
            return json_response(400, {'error': f'Unknown resource: {resource}'})
    except Exception as e:
        print(f'auth error: {e}')
        return json_response(500, {'error': 'Внутренняя ошибка сервера'})
