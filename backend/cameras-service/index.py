"""
Объединённый сервис управления камерами и справочниками:
реестр камер, группы камер, владельцы, теги камер, теги, территориальные деления,
модели камер, группы (общие), статистика по камерам
Роутинг по query-параметру resource:
  registry | camera-groups | camera-owners | camera-tags | tags |
  territorial-divisions | models | groups | stats
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}

SCHEMA = 't_p76735805_video_surveillance_s'


def json_response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def get_conn():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)


def handle_registry(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для реестра камер"""
    conn = get_conn()
    cursor = conn.cursor()

    try:
        if method == 'GET':
            cursor.execute(f'''
                SELECT id, name, rtsp_url, rtsp_login, rtsp_password, model_id,
                       ptz_ip, ptz_port, ptz_login, ptz_password, owner, address,
                       latitude, longitude, territorial_division, archive_depth_days,
                       created_at, updated_at
                FROM {SCHEMA}.cameras_registry
                ORDER BY created_at DESC
            ''')
            cameras = cursor.fetchall()

            result = []
            for cam in cameras:
                result.append({
                    'id': cam['id'],
                    'name': cam['name'],
                    'rtsp_url': cam['rtsp_url'],
                    'rtsp_login': cam['rtsp_login'],
                    'rtsp_password': cam['rtsp_password'],
                    'model_id': cam['model_id'],
                    'ptz_ip': cam['ptz_ip'],
                    'ptz_port': cam['ptz_port'],
                    'ptz_login': cam['ptz_login'],
                    'ptz_password': cam['ptz_password'],
                    'owner': cam['owner'],
                    'address': cam['address'],
                    'latitude': float(cam['latitude']) if cam['latitude'] else None,
                    'longitude': float(cam['longitude']) if cam['longitude'] else None,
                    'territorial_division': cam['territorial_division'],
                    'archive_depth_days': cam['archive_depth_days'],
                    'created_at': cam['created_at'].isoformat() if cam['created_at'] else None,
                    'updated_at': cam['updated_at'].isoformat() if cam['updated_at'] else None
                })

            cursor.close()
            conn.close()
            return json_response(200, result)

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            cursor.execute(f'''
                INSERT INTO {SCHEMA}.cameras_registry
                (name, rtsp_url, rtsp_login, rtsp_password, model_id, ptz_ip, ptz_port,
                 ptz_login, ptz_password, owner, address, latitude, longitude,
                 territorial_division, archive_depth_days)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data.get('name'),
                body_data.get('rtsp_url'),
                body_data.get('rtsp_login'),
                body_data.get('rtsp_password'),
                body_data.get('model_id'),
                body_data.get('ptz_ip'),
                body_data.get('ptz_port'),
                body_data.get('ptz_login'),
                body_data.get('ptz_password'),
                body_data.get('owner'),
                body_data.get('address'),
                body_data.get('latitude'),
                body_data.get('longitude'),
                body_data.get('territorial_division'),
                body_data.get('archive_depth_days', 30)
            ))

            camera_id = cursor.fetchone()['id']
            conn.commit()
            cursor.close()
            conn.close()
            return json_response(201, {'id': camera_id, 'message': 'Camera created'})

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            camera_id = body_data.get('id')

            if not camera_id:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Camera ID required'})

            cursor.execute(f'''
                UPDATE {SCHEMA}.cameras_registry
                SET name = %s, rtsp_url = %s, rtsp_login = %s, rtsp_password = %s,
                    model_id = %s, ptz_ip = %s, ptz_port = %s, ptz_login = %s,
                    ptz_password = %s, owner = %s, address = %s, latitude = %s,
                    longitude = %s, territorial_division = %s, archive_depth_days = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data.get('name'),
                body_data.get('rtsp_url'),
                body_data.get('rtsp_login'),
                body_data.get('rtsp_password'),
                body_data.get('model_id'),
                body_data.get('ptz_ip'),
                body_data.get('ptz_port'),
                body_data.get('ptz_login'),
                body_data.get('ptz_password'),
                body_data.get('owner'),
                body_data.get('address'),
                body_data.get('latitude'),
                body_data.get('longitude'),
                body_data.get('territorial_division'),
                body_data.get('archive_depth_days'),
                camera_id
            ))

            conn.commit()
            cursor.close()
            conn.close()
            return json_response(200, {'message': 'Camera updated'})

        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            camera_id = body_data.get('id')

            if not camera_id:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Camera ID required'})

            cursor.execute(f'DELETE FROM {SCHEMA}.cameras_registry WHERE id = %s', (camera_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return json_response(200, {'message': 'Camera deleted'})

        cursor.close()
        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        cursor.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_camera_groups(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для групп камер"""
    conn = get_conn()
    cursor = conn.cursor()

    try:
        if method == 'GET':
            cursor.execute(f'''
                SELECT id, name, description, camera_ids, created_at, updated_at
                FROM {SCHEMA}.camera_groups
                ORDER BY created_at DESC
            ''')
            groups = cursor.fetchall()

            result = []
            for group in groups:
                result.append({
                    'id': group['id'],
                    'name': group['name'],
                    'description': group['description'],
                    'camera_ids': group['camera_ids'] if group['camera_ids'] else [],
                    'created_at': group['created_at'].isoformat() if group['created_at'] else None,
                    'updated_at': group['updated_at'].isoformat() if group['updated_at'] else None
                })

            cursor.close()
            conn.close()
            return json_response(200, result)

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            cursor.execute(f'''
                INSERT INTO {SCHEMA}.camera_groups (name, description, camera_ids)
                VALUES (%s, %s, %s)
                RETURNING id
            ''', (body_data.get('name'), body_data.get('description'), body_data.get('camera_ids', [])))

            group_id = cursor.fetchone()['id']
            conn.commit()
            cursor.close()
            conn.close()
            return json_response(201, {'id': group_id, 'message': 'Camera group created'})

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            group_id = body_data.get('id')

            if not group_id:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Group ID required'})

            cursor.execute(f'''
                UPDATE {SCHEMA}.camera_groups
                SET name = %s, description = %s, camera_ids = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (body_data.get('name'), body_data.get('description'), body_data.get('camera_ids', []), group_id))

            conn.commit()
            cursor.close()
            conn.close()
            return json_response(200, {'message': 'Camera group updated'})

        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            group_id = body_data.get('id')

            if not group_id:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Group ID required'})

            cursor.execute(f'DELETE FROM {SCHEMA}.camera_groups WHERE id = %s', (group_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return json_response(200, {'message': 'Camera group deleted'})

        cursor.close()
        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        cursor.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_camera_owners(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для владельцев камер"""
    conn = get_conn()

    try:
        if method == 'GET':
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, description, parent_id, created_at, updated_at,
                       responsible_full_name, responsible_phone, responsible_email, responsible_position,
                       head_full_name, head_position, head_phone, head_email
                FROM camera_owners
                ORDER BY name
            ''')
            owners = cursor.fetchall()
            cursor.close()
            conn.close()
            return json_response(200, [dict(row) for row in owners])

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', '').strip()
            if not name:
                conn.close()
                return json_response(400, {'error': 'name обязателен'})

            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO camera_owners (name, description, parent_id,
                                          responsible_full_name, responsible_phone,
                                          responsible_email, responsible_position,
                                          head_full_name, head_position, head_phone, head_email)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, description, parent_id, created_at, updated_at,
                          responsible_full_name, responsible_phone, responsible_email, responsible_position,
                          head_full_name, head_position, head_phone, head_email
            ''', (name, body_data.get('description'), body_data.get('parent_id'),
                  body_data.get('responsible_full_name'), body_data.get('responsible_phone'),
                  body_data.get('responsible_email'), body_data.get('responsible_position'),
                  body_data.get('head_full_name'), body_data.get('head_position'),
                  body_data.get('head_phone'), body_data.get('head_email')))

            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            return json_response(201, dict(result))

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            owner_id = body_data.get('id')
            name = body_data.get('name', '').strip()

            if not owner_id or not name:
                conn.close()
                return json_response(400, {'error': 'id и name обязательны'})

            cursor = conn.cursor()
            cursor.execute('''
                UPDATE camera_owners
                SET name = %s, description = %s, parent_id = %s, updated_at = CURRENT_TIMESTAMP,
                    responsible_full_name = %s, responsible_phone = %s,
                    responsible_email = %s, responsible_position = %s,
                    head_full_name = %s, head_position = %s, head_phone = %s, head_email = %s
                WHERE id = %s
                RETURNING id, name, description, parent_id, created_at, updated_at,
                          responsible_full_name, responsible_phone, responsible_email, responsible_position,
                          head_full_name, head_position, head_phone, head_email
            ''', (name, body_data.get('description'), body_data.get('parent_id'),
                  body_data.get('responsible_full_name'), body_data.get('responsible_phone'),
                  body_data.get('responsible_email'), body_data.get('responsible_position'),
                  body_data.get('head_full_name'), body_data.get('head_position'),
                  body_data.get('head_phone'), body_data.get('head_email'), owner_id))

            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if not result:
                return json_response(404, {'error': 'Owner not found'})
            return json_response(200, dict(result))

        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            owner_id = body_data.get('id')

            if not owner_id:
                conn.close()
                return json_response(400, {'error': 'id обязателен'})

            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) as count FROM camera_owners WHERE parent_id = %s', (owner_id,))
            children_count = cursor.fetchone()['count']

            if children_count > 0:
                cursor.close()
                conn.close()
                return json_response(400, {'error': 'Cannot delete owner with children'})

            cursor.execute('DELETE FROM camera_owners WHERE id = %s RETURNING id', (owner_id,))
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()

            if not result:
                return json_response(404, {'error': 'Owner not found'})
            return json_response(200, {'success': True, 'id': owner_id})

        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_camera_tags(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для тегов камер"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])

    if method == 'GET':
        cur = conn.cursor()
        cur.execute(
            f'SELECT id, name, color, description, created_at FROM {SCHEMA}.camera_tags ORDER BY name'
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        tags = [
            {'id': r[0], 'name': r[1], 'color': r[2], 'description': r[3], 'created_at': str(r[4])}
            for r in rows
        ]
        return json_response(200, tags)

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = body.get('name', '').strip()
        color = body.get('color', '#6366f1')
        description = body.get('description', '')
        if not name:
            conn.close()
            return json_response(400, {'error': 'name required'})
        cur = conn.cursor()
        cur.execute(
            f'INSERT INTO {SCHEMA}.camera_tags (name, color, description) VALUES (%s, %s, %s) RETURNING id',
            (name, color, description),
        )
        tag_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return json_response(201, {'id': tag_id, 'name': name, 'color': color, 'description': description})

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        tag_id = body.get('id')
        name = body.get('name', '').strip()
        color = body.get('color', '#6366f1')
        description = body.get('description', '')
        if not tag_id or not name:
            conn.close()
            return json_response(400, {'error': 'id and name required'})
        cur = conn.cursor()
        cur.execute(
            f'UPDATE {SCHEMA}.camera_tags SET name=%s, color=%s, description=%s WHERE id=%s',
            (name, color, description, tag_id),
        )
        conn.commit()
        cur.close()
        conn.close()
        return json_response(200, {'success': True})

    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        tag_id = body.get('id')
        if not tag_id:
            conn.close()
            return json_response(400, {'error': 'id required'})
        cur = conn.cursor()
        cur.execute(f'DELETE FROM {SCHEMA}.camera_tags WHERE id=%s', (tag_id,))
        conn.commit()
        cur.close()
        conn.close()
        return json_response(200, {'success': True})

    conn.close()
    return json_response(405, {'error': 'Method not allowed'})


def handle_tags(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """API для тегов (с группами тегов) - устаревший отдельный функционал тегов"""
    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == 'GET':
            cur.execute('''
                SELECT
                    ct.*,
                    tg.name as tag_group_name,
                    tg.color as tag_group_color,
                    COUNT(DISTINCT cta.camera_id) as camera_count
                FROM camera_tags ct
                LEFT JOIN tag_groups tg ON ct.tag_group_id = tg.id
                LEFT JOIN camera_tag_assignments cta ON ct.id = cta.tag_id
                GROUP BY ct.id, tg.name, tg.color
                ORDER BY tg.name, ct.name
            ''')

            tags = cur.fetchall()
            cur.close()
            conn.close()
            return json_response(200, [dict(t) for t in tags])

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))

            if 'name' not in body_data:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'Поле name обязательно'})

            cur.execute('''
                INSERT INTO camera_tags (name, tag_group_id, color, description)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['name'],
                body_data.get('tag_group_id'),
                body_data.get('color', '#3b82f6'),
                body_data.get('description', '')
            ))

            tag_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            return json_response(201, {'id': tag_id, 'message': 'Tag created'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Метод не поддерживается'})

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_territorial_divisions(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для территориальных делений"""
    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        division_id = params.get('id')

        if division_id:
            cur.execute("SELECT * FROM territorial_divisions WHERE id = %s", (division_id,))
            division = cur.fetchone()
            cur.close()
            conn.close()

            if division:
                return json_response(200, dict(division))
            return json_response(404, {'error': 'Division not found'})
        else:
            cur.execute("SELECT * FROM territorial_divisions ORDER BY created_at DESC")
            divisions = cur.fetchall()
            cur.close()
            conn.close()
            return json_response(200, [dict(d) for d in divisions])

    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        name = body_data.get('name', '')
        camera_count = body_data.get('camera_count', 0)
        parent_id = body_data.get('parent_id')
        color = body_data.get('color', 'bg-blue-500')

        if not name:
            cur.close()
            conn.close()
            return json_response(400, {'error': 'Name is required'})

        cur.execute(
            "INSERT INTO territorial_divisions (name, camera_count, parent_id, color) VALUES (%s, %s, %s, %s) RETURNING *",
            (name, camera_count, parent_id, color)
        )
        new_division = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return json_response(201, dict(new_division))

    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        division_id = body_data.get('id')
        name = body_data.get('name')
        camera_count = body_data.get('camera_count')
        parent_id = body_data.get('parent_id')
        color = body_data.get('color')

        if not division_id:
            cur.close()
            conn.close()
            return json_response(400, {'error': 'ID is required'})

        cur.execute(
            "UPDATE territorial_divisions SET name = %s, camera_count = %s, parent_id = %s, color = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
            (name, camera_count, parent_id, color, division_id)
        )
        updated_division = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if updated_division:
            return json_response(200, dict(updated_division))
        return json_response(404, {'error': 'Division not found'})

    if method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        division_id = body_data.get('id')

        if not division_id:
            cur.close()
            conn.close()
            return json_response(400, {'error': 'ID is required'})

        cur.execute("DELETE FROM territorial_divisions WHERE id = %s RETURNING id", (division_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if deleted:
            return json_response(200, {'success': True, 'id': deleted['id']})
        return json_response(404, {'error': 'Division not found'})

    cur.close()
    conn.close()
    return json_response(405, {'error': 'Method not allowed'})


def handle_models(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """CRUD для моделей камер"""
    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == 'GET':
            cur.execute(f'''
                SELECT * FROM {SCHEMA}.camera_models
                ORDER BY manufacturer, model_name
            ''')
            models = cur.fetchall()
            cur.close()
            conn.close()
            return json_response(200, [dict(m) for m in models])

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))

            if 'id' not in body_data:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'ID обязателен'})

            cur.execute(f'''
                UPDATE {SCHEMA}.camera_models
                SET manufacturer = %s, model_name = %s, description = %s,
                    supports_ptz = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id
            ''', (
                body_data.get('manufacturer'),
                body_data.get('model_name'),
                body_data.get('description', ''),
                body_data.get('supports_ptz', False),
                body_data['id']
            ))

            if not cur.fetchone():
                cur.close()
                conn.close()
                return json_response(404, {'error': 'Модель не найдена'})

            conn.commit()
            cur.close()
            conn.close()
            return json_response(200, {'success': True})

        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))

            if 'id' not in body_data:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'ID обязателен'})

            cur.execute(f'''
                DELETE FROM {SCHEMA}.camera_models
                WHERE id = %s
                RETURNING id
            ''', (body_data['id'],))

            if not cur.fetchone():
                cur.close()
                conn.close()
                return json_response(404, {'error': 'Модель не найдена'})

            conn.commit()
            cur.close()
            conn.close()
            return json_response(200, {'success': True})

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))

            required_fields = ['manufacturer', 'model_name']
            for field in required_fields:
                if field not in body_data:
                    cur.close()
                    conn.close()
                    return json_response(400, {'error': f'Поле {field} обязательно'})

            cur.execute(f'''
                INSERT INTO {SCHEMA}.camera_models (
                    manufacturer, model_name, description, supports_ptz
                ) VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['manufacturer'],
                body_data['model_name'],
                body_data.get('description', ''),
                body_data.get('supports_ptz', False)
            ))

            model_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            return json_response(201, {'id': model_id, 'message': 'Model created'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Метод не поддерживается'})

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_groups(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """API для общих групп камер (с parent_group_id) - устаревший функционал"""
    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == 'GET':
            cur.execute('''
                SELECT
                    g.*,
                    pg.name as parent_group_name,
                    COUNT(DISTINCT cgm.camera_id) as camera_count
                FROM camera_groups g
                LEFT JOIN camera_groups pg ON g.parent_group_id = pg.id
                LEFT JOIN camera_group_members cgm ON g.id = cgm.group_id
                GROUP BY g.id, pg.name
                ORDER BY g.name
            ''')

            groups = cur.fetchall()
            cur.close()
            conn.close()
            return json_response(200, [dict(g) for g in groups])

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))

            if 'name' not in body_data:
                cur.close()
                conn.close()
                return json_response(400, {'error': 'Поле name обязательно'})

            cur.execute('''
                INSERT INTO camera_groups (name, parent_group_id, description)
                VALUES (%s, %s, %s)
                RETURNING id
            ''', (
                body_data['name'],
                body_data.get('parent_group_id'),
                body_data.get('description', '')
            ))

            group_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            return json_response(201, {'id': group_id, 'message': 'Group created'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Метод не поддерживается'})

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handle_stats(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Статистика по камерам"""
    if method != 'GET':
        return json_response(405, {'error': 'Метод не поддерживается'})

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(f'''
            SELECT
                COUNT(*) as total,
                0 as active,
                0 as inactive,
                0 as problem,
                0 as total_traffic,
                0 as avg_fps
            FROM {SCHEMA}.cameras_registry
        ''')
        stats = cur.fetchone()

        cur.execute(f'''
            SELECT owner, COUNT(*) as count
            FROM {SCHEMA}.cameras_registry
            WHERE owner IS NOT NULL
            GROUP BY owner
            ORDER BY count DESC
        ''')
        owners = cur.fetchall()

        cur.execute(f'''
            SELECT territorial_division as group, COUNT(*) as count
            FROM {SCHEMA}.cameras_registry
            WHERE territorial_division IS NOT NULL
            GROUP BY territorial_division
            ORDER BY count DESC
        ''')
        groups = cur.fetchall()

        result = {
            'total': stats['total'],
            'active': stats['active'],
            'inactive': stats['inactive'],
            'problem': stats['problem'],
            'total_traffic': float(stats['total_traffic']),
            'avg_fps': float(stats['avg_fps']),
            'by_owner': [dict(row) for row in owners],
            'by_group': [dict(row) for row in groups]
        }

        cur.close()
        conn.close()
        return json_response(200, result)

    except Exception as e:
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Объединённый сервис камер и справочников
    Args: event - dict с httpMethod, body, queryStringParameters
          (resource=registry|camera-groups|camera-owners|camera-tags|tags|
                    territorial-divisions|models|groups|stats)
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
    resource = query_params.get('resource', 'registry')

    handlers = {
        'registry': handle_registry,
        'camera-groups': handle_camera_groups,
        'camera-owners': handle_camera_owners,
        'camera-tags': handle_camera_tags,
        'tags': handle_tags,
        'territorial-divisions': handle_territorial_divisions,
        'models': handle_models,
        'groups': handle_groups,
        'stats': handle_stats,
    }

    fn = handlers.get(resource)
    if not fn:
        return json_response(400, {'error': f'Unknown resource: {resource}'})

    try:
        return fn(event, method)
    except Exception as e:
        return json_response(500, {'error': f'Ошибка сервера: {str(e)}'})
