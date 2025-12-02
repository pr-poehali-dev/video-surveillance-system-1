'''
Business: API для управления камерами видеонаблюдения
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с request_id, function_name
Returns: HTTP response dict со списком камер или результатом операции
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT 
                    c.id, c.name, c.rtsp_url, c.owner, c.address, 
                    c.latitude, c.longitude, c.territorial_division,
                    c.status, c.created_at, c.description,
                    cm.manufacturer, cm.model_name
                FROM t_p76735805_video_surveillance_s.cameras_registry c
                LEFT JOIN t_p76735805_video_surveillance_s.camera_models cm ON c.model_id = cm.id
                ORDER BY c.created_at DESC
            ''')
            
            cameras = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(cam) for cam in cameras], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['name', 'rtsp_url']
            for field in required_fields:
                if not body_data.get(field):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Поле {field} обязательно'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.cameras_registry (
                    name, rtsp_url, rtsp_login, rtsp_password,
                    model_id, ptz_ip, ptz_port, ptz_login, ptz_password,
                    owner, address, latitude, longitude,
                    territorial_division, archive_depth_days,
                    description, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['name'],
                body_data['rtsp_url'],
                body_data.get('rtsp_login'),
                body_data.get('rtsp_password'),
                body_data.get('model_id'),
                body_data.get('ptz_ip'),
                body_data.get('ptz_port'),
                body_data.get('ptz_login'),
                body_data.get('ptz_password'),
                body_data.get('owner', ''),
                body_data.get('address', ''),
                body_data.get('latitude'),
                body_data.get('longitude'),
                body_data.get('territorial_division', ''),
                body_data.get('archive_depth_days', 30),
                body_data.get('description', ''),
                body_data.get('status', 'active')
            ))
            
            camera_id = cur.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': camera_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            camera_id = body_data.get('id')
            
            if not camera_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID камеры обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE t_p76735805_video_surveillance_s.cameras_registry
                SET name = %s, rtsp_url = %s, rtsp_login = %s, rtsp_password = %s,
                    model_id = %s, ptz_ip = %s, ptz_port = %s, ptz_login = %s, ptz_password = %s,
                    owner = %s, address = %s, latitude = %s, longitude = %s,
                    territorial_division = %s, archive_depth_days = %s, description = %s, status = %s
                WHERE id = %s
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
                body_data.get('archive_depth_days'),
                body_data.get('description'),
                body_data.get('status'),
                camera_id
            ))
            
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Камера не найдена'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            camera_id = body_data.get('id')
            
            if not camera_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID камеры обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                DELETE FROM t_p76735805_video_surveillance_s.cameras_registry
                WHERE id = %s
                RETURNING id
            ''', (camera_id,))
            
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Камера не найдена'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
