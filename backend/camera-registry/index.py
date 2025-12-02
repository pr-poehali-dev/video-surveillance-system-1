'''
Business: CRUD операции для управления реестром камер видеонаблюдения
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с данными камер
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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('''
                SELECT id, name, rtsp_url, rtsp_login, rtsp_password, model_id,
                       ptz_ip, ptz_port, ptz_login, ptz_password, owner, address,
                       latitude, longitude, territorial_division, archive_depth_days,
                       created_at, updated_at
                FROM t_p76735805_video_surveillance_s.cameras_registry
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
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.cameras_registry
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
                    'body': json.dumps({'error': 'Camera ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE t_p76735805_video_surveillance_s.cameras_registry
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
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Camera updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            camera_id = body_data.get('id')
            
            if not camera_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Camera ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                DELETE FROM t_p76735805_video_surveillance_s.cameras_registry
                WHERE id = %s
            ''', (camera_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Camera deleted'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
