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
            params = event.get('queryStringParameters') or {}
            camera_id = params.get('id')

            if camera_id:
                cursor.execute(f'''
                    SELECT id, name, rtsp_url, rtsp_login, rtsp_password, model_id,
                           ptz_ip, ptz_port, ptz_login, ptz_password, owner, address,
                           latitude, longitude, territorial_division, archive_depth_days,
                           status, resolution, fps, traffic, created_at, updated_at
                    FROM {SCHEMA}.cameras_registry
                    WHERE id = %s
                ''', (camera_id,))
                cam = cursor.fetchone()
                cursor.close()
                conn.close()

                if not cam:
                    return json_response(404, {'error': 'Camera not found'})

                return json_response(200, {
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
                    'status': cam['status'],
                    'resolution': cam['resolution'],
                    'fps': cam['fps'],
                    'traffic': float(cam['traffic']) if cam['traffic'] is not None else None,
                    'created_at': cam['created_at'].isoformat() if cam['created_at'] else None,
                    'updated_at': cam['updated_at'].isoformat() if cam['updated_at'] else None
                })

            status_filter = params.get('status')
            owner_filter = params.get('owner')
            search_filter = params.get('search')

            query = f'''
                SELECT id, name, rtsp_url, rtsp_login, rtsp_password, model_id,
                       ptz_ip, ptz_port, ptz_login, ptz_password, owner, address,
                       latitude, longitude, territorial_division, archive_depth_days,
                       status, resolution, fps, traffic, created_at, updated_at
                FROM {SCHEMA}.cameras_registry
                WHERE 1=1
            '''
            query_values = []

            if status_filter and status_filter != 'all':
                query += ' AND status = %s'
                query_values.append(status_filter)
            if owner_filter and owner_filter != 'all':
                query += ' AND owner = %s'
                query_values.append(owner_filter)
            if search_filter:
                query += ' AND (name ILIKE %s OR address ILIKE %s OR owner ILIKE %s)'
                like_value = f'%{search_filter}%'
                query_values.extend([like_value, like_value, like_value])

            query += ' ORDER BY created_at DESC'

            cursor.execute(query, query_values)
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
                    'status': cam['status'],
                    'resolution': cam['resolution'],
                    'fps': cam['fps'],
                    'traffic': float(cam['traffic']) if cam['traffic'] is not None else None,
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
                 territorial_division, archive_depth_days, status, resolution, fps, traffic)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                body_data.get('archive_depth_days', 30),
                body_data.get('status', 'active'),
                body_data.get('resolution'),
                body_data.get('fps'),
                body_data.get('traffic')
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
                    status = COALESCE(%s, status),
                    resolution = COALESCE(%s, resolution),
                    fps = COALESCE(%s, fps),
                    traffic = COALESCE(%s, traffic),
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
                body_data.get('status'),
                body_data.get('resolution'),
                body_data.get('fps'),
                body_data.get('traffic'),
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
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
                COUNT(*) FILTER (WHERE status = 'problem') as problem,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_24h,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_7d,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_30d,
                COALESCE(SUM(traffic), 0) as total_traffic,
                COALESCE(AVG(fps), 0) as avg_fps
            FROM {SCHEMA}.cameras_registry
        ''')
        stats = cur.fetchone()

        cur.execute(f'''
            SELECT COUNT(*) as users_total,
                   COUNT(*) FILTER (WHERE is_online) as users_online
            FROM {SCHEMA}.system_users
        ''')
        users_stats = cur.fetchone()

        cur.execute(f'''
            SELECT o.id, TRIM(o.name) as name, o.parent_id,
                   COUNT(c.id) as total,
                   COUNT(c.id) FILTER (WHERE c.status = 'active') as active,
                   COUNT(c.id) FILTER (WHERE c.status = 'inactive') as inactive,
                   COUNT(c.id) FILTER (WHERE c.status = 'problem') as problem
            FROM {SCHEMA}.camera_owners o
            LEFT JOIN {SCHEMA}.cameras_registry c ON TRIM(c.owner) = TRIM(o.name)
            GROUP BY o.id, o.name, o.parent_id
            ORDER BY o.id
        ''')
        owners_tree = cur.fetchall()

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
            'new_24h': stats['new_24h'],
            'new_7d': stats['new_7d'],
            'new_30d': stats['new_30d'],
            'users_total': users_stats['users_total'],
            'users_online': users_stats['users_online'],
            'owners_tree': [dict(row) for row in owners_tree],
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


def handle_photo_archive(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Задания фотоархива и снимки"""
    conn = get_conn()
    cur = conn.cursor()
    params = event.get('queryStringParameters') or {}

    try:
        if method == 'GET':
            task_id = params.get('task_id')
            if task_id:
                cur.execute(f'''
                    SELECT id, task_id, camera_name, url, taken_at
                    FROM {SCHEMA}.photo_archive_screenshots
                    WHERE task_id = %s ORDER BY taken_at DESC
                ''', (task_id,))
                rows = cur.fetchall()
                result = [{
                    'id': r['id'], 'task_id': r['task_id'], 'camera': r['camera_name'],
                    'url': r['url'],
                    'timestamp': r['taken_at'].strftime('%Y-%m-%d %H:%M')
                } for r in rows]
            else:
                cur.execute(f'''
                    SELECT t.id, t.name, t.cameras, t.start_date, t.end_date,
                           t.interval_seconds, t.daily_hour, t.status,
                           (SELECT COUNT(*) FROM {SCHEMA}.photo_archive_screenshots s WHERE s.task_id = t.id) as total
                    FROM {SCHEMA}.photo_archive_tasks t
                    ORDER BY t.created_at DESC
                ''')
                rows = cur.fetchall()
                result = [{
                    'id': r['id'], 'name': r['name'], 'cameras': r['cameras'],
                    'startDate': r['start_date'].strftime('%Y-%m-%dT%H:%M'),
                    'endDate': r['end_date'].strftime('%Y-%m-%dT%H:%M'),
                    'interval': r['interval_seconds'], 'status': r['status'],
                    'totalScreenshots': r['total']
                } for r in rows]
            cur.close()
            conn.close()
            return json_response(200, result)

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            cur.execute(f'''
                INSERT INTO {SCHEMA}.photo_archive_tasks
                (name, cameras, start_date, end_date, interval_seconds, daily_hour, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active') RETURNING id
            ''', (
                body.get('name'), body.get('cameras', []), body.get('start_date'),
                body.get('end_date'), body.get('interval', 300), body.get('daily_hour')
            ))
            new_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            return json_response(201, {'id': new_id})

        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            cur.execute(f'''
                UPDATE {SCHEMA}.photo_archive_tasks SET status = %s WHERE id = %s
            ''', (body.get('status'), body.get('id')))
            conn.commit()
            cur.close()
            conn.close()
            return json_response(200, {'message': 'Updated'})

        if method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            cur.execute(f'DELETE FROM {SCHEMA}.photo_archive_screenshots WHERE task_id = %s', (task_id,))
            cur.execute(f'DELETE FROM {SCHEMA}.photo_archive_tasks WHERE id = %s', (task_id,))
            conn.commit()
            cur.close()
            conn.close()
            return json_response(200, {'message': 'Deleted'})

        cur.close()
        conn.close()
        return json_response(405, {'error': 'Method not allowed'})

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return json_response(500, {'error': str(e)})


def serialize_drone(r: Dict[str, Any]) -> Dict[str, Any]:
    dt = r['detected_at']
    return {
        'id': r['id'],
        'date': dt.strftime('%d.%m.%Y'),
        'time': dt.strftime('%H:%M:%S'),
        'type': r['drone_type'],
        'lat': float(r['latitude']),
        'lng': float(r['longitude']),
        'zone': r['zone'] or '',
        'threat': r['threat'],
        'status': r['status'],
        'altitude': r['altitude'] or 0,
        'speed': r['speed'] or 0,
        'camera': r['camera'] or '',
        'address': r['address'] or '',
        'confirmed': r['confirmed'],
        'photo_url': r['photo_url'],
    }


def handle_drone_detections(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Обнаружения БПЛА: список, добавление, обновление, удаление"""
    conn = get_conn()
    cur = conn.cursor()
    try:
        if method == 'GET':
            cur.execute(f'''
                SELECT id, detected_at, drone_type, latitude, longitude, zone, threat, status,
                       altitude, speed, camera, address, confirmed, photo_url
                FROM {SCHEMA}.drone_detections
                ORDER BY detected_at DESC, id DESC
            ''')
            return json_response(200, [serialize_drone(r) for r in cur.fetchall()])

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            drone_type = (body.get('type') or '').strip()
            if not drone_type or body.get('lat') is None or body.get('lng') is None:
                return json_response(400, {'error': 'Укажите тип БПЛА и координаты'})
            threat = body.get('threat', 'medium')
            status = body.get('status', 'active')
            if threat not in ('high', 'medium', 'low') or status not in ('active', 'neutralized', 'lost'):
                return json_response(400, {'error': 'Неверная угроза или статус'})
            cur.execute(f'''
                INSERT INTO {SCHEMA}.drone_detections
                (detected_at, drone_type, latitude, longitude, zone, threat, status,
                 altitude, speed, camera, address, confirmed, photo_url)
                VALUES (COALESCE(%s, NOW()), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('detected_at') or None, drone_type, body['lat'], body['lng'],
                body.get('zone'), threat, status, body.get('altitude'), body.get('speed'),
                body.get('camera'), body.get('address'), body.get('confirmed'), body.get('photo_url')
            ))
            new_id = cur.fetchone()['id']
            conn.commit()
            return json_response(201, {'id': new_id})

        if method == 'PUT':
            det_id = body.get('id')
            if not det_id:
                return json_response(400, {'error': 'Не указан id'})
            fields = {'status': 'status', 'threat': 'threat', 'confirmed': 'confirmed'}
            sets = []
            vals = []
            for key, col in fields.items():
                if key in body:
                    sets.append(f'{col} = %s')
                    vals.append(body[key])
            if not sets:
                return json_response(400, {'error': 'Нет данных для обновления'})
            vals.append(det_id)
            cur.execute(f'UPDATE {SCHEMA}.drone_detections SET {", ".join(sets)} WHERE id = %s', vals)
            conn.commit()
            return json_response(200, {'message': 'Updated'})

        if method == 'DELETE':
            cur.execute(f'DELETE FROM {SCHEMA}.drone_detections WHERE id = %s', (body.get('id'),))
            conn.commit()
            return json_response(200, {'message': 'Deleted'})

        return json_response(405, {'error': 'Method not allowed'})
    except Exception as e:
        conn.rollback()
        return json_response(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Объединённый сервис камер и справочников
    Args: event - dict с httpMethod, body, queryStringParameters
          (resource=registry|camera-groups|camera-owners|camera-tags|tags|
                    territorial-divisions|models|groups|stats|photo-archive|drone-detections)
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
        'photo-archive': handle_photo_archive,
        'drone-detections': handle_drone_detections,
    }

    fn = handlers.get(resource)
    if not fn:
        return json_response(400, {'error': f'Unknown resource: {resource}'})

    try:
        return fn(event, method)
    except Exception as e:
        return json_response(500, {'error': f'Ошибка сервера: {str(e)}'})