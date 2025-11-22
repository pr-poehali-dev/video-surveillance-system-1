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
                cur.execute('''
                    SELECT 
                        c.*,
                        cm.manufacturer, cm.model_name, cm.supports_ptz
                    FROM cameras_registry c
                    LEFT JOIN camera_models cm ON c.model_id = cm.id
                    WHERE c.id = %s
                ''', (int(camera_id),))
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
            
            query = '''
                SELECT 
                    c.id, c.name, c.rtsp_url, c.owner, c.address, 
                    c.latitude, c.longitude, c.territorial_division,
                    c.status, c.created_at, c.description,
                    cm.manufacturer, cm.model_name
                FROM cameras_registry c
                LEFT JOIN camera_models cm ON c.model_id = cm.id
                WHERE 1=1
            '''
            query_params: List[Any] = []
            
            if status_filter:
                query += ' AND c.status = %s'
                query_params.append(status_filter)
            
            if owner_filter:
                query += ' AND c.owner = %s'
                query_params.append(owner_filter)
            
            if search:
                query += ' AND (c.name ILIKE %s OR c.address ILIKE %s)'
                search_pattern = f'%{search}%'
                query_params.extend([search_pattern, search_pattern])
            
            query += ' ORDER BY c.created_at DESC'
            
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
            
            required_fields = ['name', 'rtsp_url']
            for field in required_fields:
                if field not in body_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Поле {field} обязательно'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute('''
                INSERT INTO cameras_registry (
                    name, rtsp_url, rtsp_login, rtsp_password,
                    model_id, ptz_ip, ptz_port, ptz_login, ptz_password,
                    owner, local_ip, local_port,
                    address, latitude, longitude,
                    territorial_division, archive_depth_days,
                    description, status
                ) VALUES (
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s
                ) RETURNING id
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
                body_data.get('local_ip'),
                body_data.get('local_port'),
                body_data.get('address', ''),
                body_data.get('latitude'),
                body_data.get('longitude'),
                body_data.get('territorial_division', ''),
                body_data.get('archive_depth_days', 30),
                body_data.get('description', ''),
                body_data.get('status', 'active')
            ))
            
            camera_id = cur.fetchone()['id']
            
            if body_data.get('group_ids'):
                for group_id in body_data['group_ids']:
                    cur.execute('''
                        INSERT INTO camera_group_members (camera_id, group_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    ''', (camera_id, group_id))
            
            if body_data.get('tag_ids'):
                for tag_id in body_data['tag_ids']:
                    cur.execute('''
                        INSERT INTO camera_tag_assignments (camera_id, tag_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    ''', (camera_id, tag_id))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': camera_id, 'message': 'Camera created'}),
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
            
            allowed_fields = ['name', 'rtsp_url', 'rtsp_login', 'rtsp_password', 'model_id', 
                            'ptz_ip', 'ptz_port', 'ptz_login', 'ptz_password',
                            'owner', 'local_ip', 'local_port', 'address', 
                            'latitude', 'longitude', 'territorial_division', 
                            'archive_depth_days', 'description', 'status']
            
            for field in allowed_fields:
                if field in body_data:
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
                UPDATE cameras_registry 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id
            '''
            
            cur.execute(query, update_values)
            updated_camera = cur.fetchone()
            
            if not updated_camera:
                conn.commit()
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
                'body': json.dumps({'message': 'Camera updated'}),
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