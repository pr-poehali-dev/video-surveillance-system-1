"""
Объединённый сервис авторизации: вход, сессии, вход под другим пользователем
Роутинг по query-параметру resource: auth | sessions | impersonate
"""

import json
import os
import hashlib
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def json_response(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body),
        'isBase64Encoded': False
    }


def handle_auth(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Авторизация пользователя по логину и паролю"""
    if method != 'POST':
        return json_response(405, {'error': 'Метод не поддерживается'})

    body_data = json.loads(event.get('body', '{}'))
    login = body_data.get('login', '').strip()
    password = body_data.get('password', '').strip()

    if not login or not password:
        return json_response(400, {'error': 'Логин и пароль обязательны'})

    password_hash = hash_password(password)
    login_escaped = login.replace("'", "''")
    password_hash_escaped = password_hash.replace("'", "''")

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = f"""
        SELECT id, full_name, email, login, role_id, user_group_id,
               camera_group_id, company, position
        FROM t_p76735805_video_surveillance_s.system_users
        WHERE login = '{login_escaped}' AND password_hash = '{password_hash_escaped}'
    """
    cur.execute(query)
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return json_response(401, {'error': 'Некорректный логин и/или пароль'})

    update_query = f"""
        UPDATE t_p76735805_video_surveillance_s.system_users
        SET last_login = NOW(), is_online = true
        WHERE id = {user['id']}
    """
    cur.execute(update_query)
    conn.commit()

    cur.close()
    conn.close()

    return json_response(200, {'success': True, 'user': dict(user)})


def handle_sessions(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Управление сессиями пользователей"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            cur.execute('''
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
            ''')

            sessions = cur.fetchall()
            result = [dict(row) for row in sessions]

            for session in result:
                if session.get('last_activity'):
                    session['last_activity'] = session['last_activity'].isoformat()
                if session.get('created_at'):
                    session['created_at'] = session['created_at'].isoformat()

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }

        elif method == 'POST':
            body_str = event.get('body', '{}')
            if not body_str or body_str.strip() == '':
                body_str = '{}'

            try:
                body_data = json.loads(body_str)
            except json.JSONDecodeError:
                body_data = {}

            user_id = body_data.get('user_id')
            session_token = body_data.get('session_token')
            ip_address = body_data.get('ip_address', '')
            user_agent = body_data.get('user_agent', '')
            current_route = body_data.get('current_route', '/')

            if not user_id or not session_token:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'user_id и session_token обязательны'})

            session_token_escaped = session_token.replace("'", "''")
            ip_escaped = ip_address.replace("'", "''") if ip_address else ''
            user_agent_escaped = user_agent.replace("'", "''") if user_agent else ''
            route_escaped = current_route.replace("'", "''") if current_route else '/'

            check_query = f"""
                SELECT id FROM t_p76735805_video_surveillance_s.user_sessions
                WHERE session_token = '{session_token_escaped}'
            """
            cur.execute(check_query)
            existing = cur.fetchone()

            if existing:
                update_query = f"""
                    UPDATE t_p76735805_video_surveillance_s.user_sessions
                    SET current_route = '{route_escaped}',
                        last_activity = NOW(),
                        expires_at = NOW() + INTERVAL '24 hours'
                    WHERE session_token = '{session_token_escaped}'
                    RETURNING id
                """
                cur.execute(update_query)
                conn.commit()
                session_id = cur.fetchone()['id']
            else:
                insert_query = f"""
                    INSERT INTO t_p76735805_video_surveillance_s.user_sessions
                    (user_id, session_token, ip_address, user_agent, current_route, expires_at)
                    VALUES ({user_id}, '{session_token_escaped}', '{ip_escaped}',
                            '{user_agent_escaped}', '{route_escaped}', NOW() + INTERVAL '24 hours')
                    RETURNING id
                """
                cur.execute(insert_query)
                conn.commit()
                session_id = cur.fetchone()['id']

            cur.close()
            conn.close()

            return json_response(200, {'success': True, 'session_id': session_id})

        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            session_token = params.get('session_token', '')

            if not session_token:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'session_token обязателен'})

            token_escaped = session_token.replace("'", "''")

            delete_query = f"""
                UPDATE t_p76735805_video_surveillance_s.user_sessions
                SET expires_at = NOW() - INTERVAL '1 hour'
                WHERE session_token = '{token_escaped}'
            """
            cur.execute(delete_query)
            conn.commit()

            cur.close()
            conn.close()

            return json_response(200, {'success': True})

        else:
            cur.close()
            conn.close()
            return json_response(405, {'error': 'Метод не поддерживается'})

    except Exception as e:
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_impersonate(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Получение данных для входа за другого пользователя"""
    if method != 'GET':
        return json_response(405, {'error': 'Method not allowed'})

    query_params = event.get('queryStringParameters') or {}
    user_id = query_params.get('user_id')

    if not user_id:
        return json_response(400, {'error': 'user_id is required'})

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute('''
        SELECT login, password_hash, full_name
        FROM t_p76735805_video_surveillance_s.system_users
        WHERE id = %s
    ''', (user_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        return json_response(404, {'error': 'User not found'})

    return json_response(200, {
        'login': row[0],
        'password_hash': row[1],
        'full_name': row[2]
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
        return json_response(500, {'error': f'Ошибка сервера: {str(e)}'})
