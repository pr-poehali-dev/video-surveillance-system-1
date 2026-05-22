import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """CRUD для тегов камер"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            'SELECT id, name, color, description, created_at FROM t_p76735805_video_surveillance_s.camera_tags ORDER BY name'
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        tags = [
            {'id': r[0], 'name': r[1], 'color': r[2], 'description': r[3], 'created_at': str(r[4])}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps(tags)}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = body.get('name', '').strip()
        color = body.get('color', '#6366f1')
        description = body.get('description', '')
        if not name:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'name required'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO t_p76735805_video_surveillance_s.camera_tags (name, color, description) VALUES (%s, %s, %s) RETURNING id',
            (name, color, description),
        )
        tag_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 201, 'headers': cors, 'body': json.dumps({'id': tag_id, 'name': name, 'color': color, 'description': description})}

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        tag_id = body.get('id')
        name = body.get('name', '').strip()
        color = body.get('color', '#6366f1')
        description = body.get('description', '')
        if not tag_id or not name:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'id and name required'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            'UPDATE t_p76735805_video_surveillance_s.camera_tags SET name=%s, color=%s, description=%s WHERE id=%s',
            (name, color, description, tag_id),
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'success': True})}

    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        tag_id = body.get('id')
        if not tag_id:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'id required'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute('DELETE FROM t_p76735805_video_surveillance_s.camera_tags WHERE id=%s', (tag_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'success': True})}

    return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}
