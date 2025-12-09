'''
Business: API для управления группами пользователей с иерархической структурой
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с request_id, function_name
Returns: HTTP response dict со списком групп или результатом операции
'''

import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class UserGroupCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    user_count: int = 0

class UserGroupUpdate(BaseModel):
    id: int
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    user_count: int = 0

class UserGroupDelete(BaseModel):
    id: int

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

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
    
    conn = get_db_connection()
    
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
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps([dict(row) for row in groups], default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            group = UserGroupCreate(**body_data)
            
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.user_groups 
                (name, description, parent_id, user_count)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, description, parent_id, user_count, created_at, updated_at
            ''', (group.name, group.description, group.parent_id, group.user_count))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(dict(result), default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            group = UserGroupUpdate(**body_data)
            
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE t_p76735805_video_surveillance_s.user_groups
                SET name = %s, description = %s, parent_id = %s, 
                    user_count = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, description, parent_id, user_count, created_at, updated_at
            ''', (group.name, group.description, group.parent_id, group.user_count, group.id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Group not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(dict(result), default=str)
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            group = UserGroupDelete(**body_data)
            
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) as count 
                FROM t_p76735805_video_surveillance_s.user_groups 
                WHERE parent_id = %s
            ''', (group.id,))
            children_count = cursor.fetchone()['count']
            
            if children_count > 0:
                cursor.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Cannot delete group with children'})
                }
            
            cursor.execute('''
                DELETE FROM t_p76735805_video_surveillance_s.user_groups 
                WHERE id = %s 
                RETURNING id
            ''', (group.id,))
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Group not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'id': group.id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()