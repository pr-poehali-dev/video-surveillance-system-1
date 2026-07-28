"""
Объединённый сервис управления пользователями: пользователи, роли, группы пользователей
Роутинг по query-параметру resource: users | roles | user-groups
"""

import json
import os
import hashlib
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def json_response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    body_str = event.get('body') or '{}'
    if not body_str.strip():
        body_str = '{}'
    try:
        return json.loads(body_str)
    except json.JSONDecodeError:
        return {}


def handle_users(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Управление пользователями системы с ролями и группами"""
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('id')

            if user_id:
                cur.execute('''
                    SELECT u.id, u.full_name, u.position, u.email, u.login, u.company,
                           u.role_id, r.name as role_name,
                           u.user_group_id, ug.name as user_group_name,
                           u.camera_group_id, cg.name as camera_group_name,
                           u.work_phone, u.mobile_phone, u.note, u.attached_files,
                           u.is_online, u.last_login, u.created_at, u.updated_at
                    FROM system_users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN user_groups ug ON u.user_group_id = ug.id
                    LEFT JOIN camera_groups cg ON u.camera_group_id = cg.id
                    WHERE u.id = %s
                ''', (user_id,))
                row = cur.fetchone()

                if not row:
                    cur.close()
                    conn.close()
                    return json_response(404, {'error': 'User not found'})

                columns = [desc[0] for desc in cur.description]
                result = dict(zip(columns, row))

                for date_field in ['last_login', 'created_at', 'updated_at']:
                    if result.get(date_field):
                        result[date_field] = result[date_field].isoformat()
            else:
                cur.execute('''
                    SELECT u.id, u.full_name, u.position, u.email, u.login, u.company,
                           u.role_id, r.name as role_name,
                           u.user_group_id, ug.name as user_group_name,
                           u.camera_group_id, cg.name as camera_group_name,
                           u.work_phone, u.mobile_phone, u.note, u.attached_files,
                           u.is_online, u.last_login, u.created_at, u.updated_at
                    FROM system_users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN user_groups ug ON u.user_group_id = ug.id
                    LEFT JOIN camera_groups cg ON u.camera_group_id = cg.id
                    ORDER BY u.created_at DESC
                ''')
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                result = []

                for row in rows:
                    user = dict(zip(columns, row))
                    for date_field in ['last_login', 'created_at', 'updated_at']:
                        if user.get(date_field):
                            user[date_field] = user[date_field].isoformat()
                    result.append(user)

            cur.close()
            conn.close()
            return json_response(200, result)

        elif method == 'POST':
            body = parse_body(event)

            required_fields = ['full_name', 'email', 'login', 'password']
            for field in required_fields:
                if not body.get(field):
                    cur.close()
                    conn.close()
                    return json_response(400, {'error': f'{field} is required'})

            password_hash = hash_password(body['password'])

            cur.execute('''
                INSERT INTO system_users
                (full_name, position, email, login, password_hash, company, role_id,
                 user_group_id, camera_group_id, work_phone, mobile_phone,
                 note, attached_files, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, full_name, position, email, login, company, role_id,
                          user_group_id, camera_group_id, work_phone, mobile_phone,
                          note, attached_files, is_online, last_login, created_at, updated_at
            ''', (
                body['full_name'],
                body.get('position'),
                body['email'],
                body['login'],
                password_hash,
                body.get('company'),
                body.get('role_id'),
                body.get('user_group_id'),
                body.get('camera_group_id'),
                body.get('work_phone'),
                body.get('mobile_phone'),
                body.get('note'),
                body.get('attached_files'),
                datetime.utcnow(),
                datetime.utcnow()
            ))

            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))

            for date_field in ['last_login', 'created_at', 'updated_at']:
                if result.get(date_field):
                    result[date_field] = result[date_field].isoformat()

            cur.execute('SELECT name FROM roles WHERE id = %s', (result.get('role_id'),))
            role_row = cur.fetchone()
            result['role_name'] = role_row[0] if role_row else None

            cur.execute('SELECT name FROM user_groups WHERE id = %s', (result.get('user_group_id'),))
            ug_row = cur.fetchone()
            result['user_group_name'] = ug_row[0] if ug_row else None

            cur.execute('SELECT name FROM camera_groups WHERE id = %s', (result.get('camera_group_id'),))
            cg_row = cur.fetchone()
            result['camera_group_name'] = cg_row[0] if cg_row else None

            conn.commit()
            cur.close()
            conn.close()

            return json_response(201, result)

        elif method == 'PUT':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('id')

            if not user_id:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'User ID is required'})

            body = parse_body(event)

            updates = []
            values = []

            allowed_fields = {
                'full_name': 'full_name',
                'position': 'position',
                'email': 'email',
                'login': 'login',
                'company': 'company',
                'role_id': 'role_id',
                'user_group_id': 'user_group_id',
                'camera_group_id': 'camera_group_id',
                'work_phone': 'work_phone',
                'mobile_phone': 'mobile_phone',
                'note': 'note',
                'attached_files': 'attached_files',
                'is_online': 'is_online'
            }

            for field, db_field in allowed_fields.items():
                if field in body:
                    updates.append(f'{db_field} = %s')
                    values.append(body[field])

            if 'password' in body and body['password']:
                if 'current_password' in body:
                    cur.execute('SELECT password_hash FROM system_users WHERE id = %s', (user_id,))
                    row = cur.fetchone()
                    if not row or row[0] != hash_password(body['current_password']):
                        cur.close()
                        conn.close()
                        return json_response(400, {'error': 'Текущий пароль указан неверно'})
                updates.append('password_hash = %s')
                values.append(hash_password(body['password']))

            updates.append('updated_at = %s')
            values.append(datetime.utcnow())
            values.append(user_id)

            cur.execute(f'''
                UPDATE system_users
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, full_name, email, login, company, role_id,
                          user_group_id, camera_group_id, work_phone, mobile_phone,
                          is_online, last_login, created_at, updated_at
            ''', values)

            row = cur.fetchone()
            if not row:
                cur.close()
                conn.close()
                return json_response(404, {'error': 'User not found'})

            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))

            for date_field in ['last_login', 'created_at', 'updated_at']:
                if result.get(date_field):
                    result[date_field] = result[date_field].isoformat()

            cur.execute('SELECT name FROM roles WHERE id = %s', (result.get('role_id'),))
            role_row = cur.fetchone()
            result['role_name'] = role_row[0] if role_row else None

            cur.execute('SELECT name FROM user_groups WHERE id = %s', (result.get('user_group_id'),))
            ug_row = cur.fetchone()
            result['user_group_name'] = ug_row[0] if ug_row else None

            cur.execute('SELECT name FROM camera_groups WHERE id = %s', (result.get('camera_group_id'),))
            cg_row = cur.fetchone()
            result['camera_group_name'] = cg_row[0] if cg_row else None

            conn.commit()
            cur.close()
            conn.close()

            return json_response(200, result)

        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('id')

            if not user_id:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'User ID is required'})

            cur.execute('DELETE FROM system_users WHERE id = %s RETURNING id', (user_id,))
            row = cur.fetchone()

            if not row:
                cur.close()
                conn.close()
                return json_response(404, {'error': 'User not found'})

            conn.commit()
            cur.close()
            conn.close()

            return json_response(200, {'message': 'User deleted successfully'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_roles(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Управление ролями пользователей с правами доступа"""
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            role_id = query_params.get('id')

            if role_id:
                cur.execute('''
                    SELECT id, name, description, permissions, created_at, updated_at,
                           (SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = roles.id) as users_count
                    FROM t_p76735805_video_surveillance_s.roles
                    WHERE id = %s
                ''', (role_id,))
            else:
                cur.execute('''
                    SELECT id, name, description, permissions, created_at, updated_at,
                           (SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = roles.id) as users_count
                    FROM t_p76735805_video_surveillance_s.roles
                    ORDER BY created_at DESC
                ''')

            columns = [desc[0] for desc in cur.description]

            if role_id:
                row = cur.fetchone()
                if not row:
                    cur.close()
                    conn.close()
                    return json_response(404, {'error': 'Role not found'})
                result = dict(zip(columns, row))
                result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
                result['updated_at'] = result['updated_at'].isoformat() if result['updated_at'] else None
            else:
                rows = cur.fetchall()
                result = []
                for row in rows:
                    role = dict(zip(columns, row))
                    role['created_at'] = role['created_at'].isoformat() if role['created_at'] else None
                    role['updated_at'] = role['updated_at'].isoformat() if role['updated_at'] else None
                    result.append(role)

            cur.close()
            conn.close()
            return json_response(200, result)

        elif method == 'POST':
            body = parse_body(event)
            name = body.get('name')
            description = body.get('description', '')
            permissions = body.get('permissions', {})

            if not name:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'Name is required'})

            cur.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.roles (name, description, permissions, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, description, permissions, created_at, updated_at
            ''', (name, description, json.dumps(permissions), datetime.utcnow(), datetime.utcnow()))

            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            result['users_count'] = 0
            result['created_at'] = result['created_at'].isoformat()
            result['updated_at'] = result['updated_at'].isoformat()

            conn.commit()
            cur.close()
            conn.close()

            return json_response(201, result)

        elif method == 'PUT':
            query_params = event.get('queryStringParameters') or {}
            role_id = query_params.get('id')

            if not role_id:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'Role ID is required'})

            body = parse_body(event)
            name = body.get('name')
            description = body.get('description')
            permissions = body.get('permissions')

            updates = []
            values = []

            if name is not None:
                updates.append('name = %s')
                values.append(name)
            if description is not None:
                updates.append('description = %s')
                values.append(description)
            if permissions is not None:
                updates.append('permissions = %s')
                values.append(json.dumps(permissions))

            updates.append('updated_at = %s')
            values.append(datetime.utcnow())
            values.append(role_id)

            cur.execute(f'''
                UPDATE t_p76735805_video_surveillance_s.roles
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, name, description, permissions, created_at, updated_at
            ''', values)

            row = cur.fetchone()
            if not row:
                cur.close()
                conn.close()
                return json_response(404, {'error': 'Role not found'})

            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            result['created_at'] = result['created_at'].isoformat()
            result['updated_at'] = result['updated_at'].isoformat()

            cur.execute('SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = %s', (role_id,))
            result['users_count'] = cur.fetchone()[0]

            conn.commit()
            cur.close()
            conn.close()

            return json_response(200, result)

        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            role_id = query_params.get('id')

            if not role_id:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'Role ID is required'})

            cur.execute('SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = %s', (role_id,))
            users_count = cur.fetchone()[0]

            if users_count > 0:
                cur.close()
                conn.close()
                return json_response(400, {'error': f'Cannot delete role with {users_count} assigned users'})

            cur.execute('DELETE FROM t_p76735805_video_surveillance_s.roles WHERE id = %s RETURNING id', (role_id,))
            row = cur.fetchone()

            if not row:
                cur.close()
                conn.close()
                return json_response(404, {'error': 'Role not found'})

            conn.commit()
            cur.close()
            conn.close()

            return json_response(200, {'message': 'Role deleted successfully'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_user_groups(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Управление группами пользователей с иерархической структурой"""
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            cursor = conn.cursor()
            cursor.execute('''
                SELECT ug.id, ug.name, ug.description, ug.parent_id,
                       (SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE user_group_id = ug.id) as user_count,
                       ug.created_at, ug.updated_at
                FROM t_p76735805_video_surveillance_s.user_groups ug
                ORDER BY ug.parent_id NULLS FIRST, ug.name
            ''')
            groups = cursor.fetchall()
            cursor.close()
            conn.close()

            return json_response(200, [dict(row) for row in groups])

        elif method == 'POST':
            body_data = parse_body(event)
            name = body_data.get('name', '').strip()
            if not name:
                conn.close()
                return json_response(400, {'error': 'name обязателен'})

            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.user_groups
                (name, description, parent_id, user_count)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, description, parent_id, user_count, created_at, updated_at
            ''', (name, body_data.get('description'), body_data.get('parent_id'), body_data.get('user_count', 0)))

            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            return json_response(201, dict(result))

        elif method == 'PUT':
            body_data = parse_body(event)
            group_id = body_data.get('id')
            name = body_data.get('name', '').strip()

            if not group_id or not name:
                conn.close()
                return json_response(400, {'error': 'id и name обязательны'})

            cursor = conn.cursor()
            cursor.execute('''
                UPDATE t_p76735805_video_surveillance_s.user_groups
                SET name = %s, description = %s, parent_id = %s,
                    user_count = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, description, parent_id, user_count, created_at, updated_at
            ''', (name, body_data.get('description'), body_data.get('parent_id'), body_data.get('user_count', 0), group_id))

            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if not result:
                return json_response(404, {'error': 'Group not found'})

            return json_response(200, dict(result))

        elif method == 'DELETE':
            body_data = parse_body(event)
            group_id = body_data.get('id')

            if not group_id:
                conn.close()
                return json_response(400, {'error': 'id обязателен'})

            cursor = conn.cursor()

            cursor.execute('''
                SELECT COUNT(*) as count
                FROM t_p76735805_video_surveillance_s.user_groups
                WHERE parent_id = %s
            ''', (group_id,))
            children_count = cursor.fetchone()['count']

            if children_count > 0:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Cannot delete group with children'})

            cursor.execute('''
                DELETE FROM t_p76735805_video_surveillance_s.user_groups
                WHERE id = %s
                RETURNING id
            ''', (group_id,))
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if not result:
                return json_response(404, {'error': 'Group not found'})

            return json_response(200, {'success': True, 'id': group_id})

        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        conn.close()
        return json_response(500, {'error': str(e)})


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Объединённый сервис: пользователи, роли, группы пользователей
    Args: event - dict с httpMethod, body, queryStringParameters (resource=users|roles|user-groups)
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
    resource = query_params.get('resource', 'users')

    try:
        if resource == 'users':
            return handle_users(event, method)
        elif resource == 'roles':
            return handle_roles(event, method)
        elif resource == 'user-groups':
            return handle_user_groups(event, method)
        else:
            return json_response(400, {'error': f'Unknown resource: {resource}'})
    except Exception as e:
        return json_response(500, {'error': f'Ошибка сервера: {str(e)}'})