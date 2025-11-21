'''
Business: API для управления камерами видеонаблюдения
Args: event с httpMethod, body, queryStringParameters
Returns: JSON с данными камер или результат операции
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            camera_id = params.get('id')
            
            if camera_id:
                cur.execute(
                    'SELECT * FROM t_p76735805_video_surveillance_s.cameras WHERE id = %s',
                    (int(camera_id),)
                )
                camera = cur.fetchone()
                
                if not camera:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Камера не найдена'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(camera), default=str),
                    'isBase64Encoded': False
                }
            
            status_filter = params.get('status')
            owner_filter = params.get('owner')
            search = params.get('search')
            
            query = 'SELECT * FROM t_p76735805_video_surveillance_s.cameras WHERE 1=1'
            query_params: List[Any] = []
            
            if status_filter:
                query += ' AND status = %s'
                query_params.append(status_filter)
            
            if owner_filter:
                query += ' AND owner = %s'
                query_params.append(owner_filter)
            
            if search:
                query += ' AND (name ILIKE %s OR address ILIKE %s)'
                search_pattern = f'%{search}%'
                query_params.extend([search_pattern, search_pattern])
            
            query += ' ORDER BY id'
            
            cur.execute(query, query_params)
            cameras = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(cam) for cam in cameras], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['name', 'address', 'owner', 'group', 'lat', 'lng']
            for field in required_fields:
                if field not in body_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Поле {field} обязательно'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.cameras 
                (name, address, status, owner, "group", lat, lng, resolution, fps, traffic)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            ''', (
                body_data['name'],
                body_data['address'],
                body_data.get('status', 'inactive'),
                body_data['owner'],
                body_data['group'],
                float(body_data['lat']),
                float(body_data['lng']),
                body_data.get('resolution', '1920x1080'),
                body_data.get('fps', 25),
                body_data.get('traffic', 0)
            ))
            
            new_camera = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_camera), default=str),
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
            
            update_fields = []
            update_values = []
            
            allowed_fields = ['name', 'address', 'status', 'owner', 'group', 'lat', 'lng', 'resolution', 'fps', 'traffic']
            for field in allowed_fields:
                if field in body_data:
                    if field == 'group':
                        update_fields.append('"group" = %s')
                    else:
                        update_fields.append(f'{field} = %s')
                    update_values.append(body_data[field])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет полей для обновления'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            update_values.append(int(camera_id))
            
            query = f'''
                UPDATE t_p76735805_video_surveillance_s.cameras 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING *
            '''
            
            cur.execute(query, update_values)
            updated_camera = cur.fetchone()
            conn.commit()
            
            if not updated_camera:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Камера не найдена'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_camera), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            camera_id = params.get('id')
            
            if not camera_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID камеры обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                'DELETE FROM t_p76735805_video_surveillance_s.cameras WHERE id = %s RETURNING id',
                (int(camera_id),)
            )
            deleted = cur.fetchone()
            conn.commit()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Камера не найдена'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Камера удалена', 'id': deleted['id']}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
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