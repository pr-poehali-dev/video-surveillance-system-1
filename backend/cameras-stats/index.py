'''
Business: API для получения статистики по камерам видеонаблюдения
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict со статистикой по камерам
'''

import json
import os
from typing import Dict, Any
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                COUNT(CASE WHEN status = 'problem' THEN 1 END) as problem,
                COALESCE(SUM(traffic), 0) as total_traffic,
                COALESCE(AVG(fps), 0) as avg_fps
            FROM t_p76735805_video_surveillance_s.cameras
        ''')
        
        stats = cur.fetchone()
        
        cur.execute('''
            SELECT owner, COUNT(*) as count
            FROM t_p76735805_video_surveillance_s.cameras
            GROUP BY owner
            ORDER BY count DESC
        ''')
        
        owners = cur.fetchall()
        
        cur.execute('''
            SELECT "group", COUNT(*) as count
            FROM t_p76735805_video_surveillance_s.cameras
            GROUP BY "group"
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
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
