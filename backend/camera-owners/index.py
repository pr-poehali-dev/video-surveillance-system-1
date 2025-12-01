import json
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class OwnerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[int] = None

class OwnerUpdate(BaseModel):
    id: int
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[int] = None

class OwnerDelete(BaseModel):
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
            'body': ''
        }
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, description, parent_id, created_at, updated_at
                FROM camera_owners
                ORDER BY name
            ''')
            owners = cursor.fetchall()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps([dict(row) for row in owners], default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            owner = OwnerCreate(**body_data)
            
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO camera_owners (name, description, parent_id)
                VALUES (%s, %s, %s)
                RETURNING id, name, description, parent_id, created_at, updated_at
            ''', (owner.name, owner.description, owner.parent_id))
            
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
            owner = OwnerUpdate(**body_data)
            
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE camera_owners
                SET name = %s, description = %s, parent_id = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, description, parent_id, created_at, updated_at
            ''', (owner.name, owner.description, owner.parent_id, owner.id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Owner not found'})
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
            owner = OwnerDelete(**body_data)
            
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) as count FROM camera_owners WHERE parent_id = %s', (owner.id,))
            children_count = cursor.fetchone()['count']
            
            if children_count > 0:
                cursor.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Cannot delete owner with children'})
                }
            
            cursor.execute('DELETE FROM camera_owners WHERE id = %s RETURNING id', (owner.id,))
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Owner not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'id': owner.id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
