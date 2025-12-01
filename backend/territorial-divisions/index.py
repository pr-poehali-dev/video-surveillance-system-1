import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage territorial divisions (CRUD operations)
    Args: event with httpMethod (GET/POST/PUT/DELETE), body, queryStringParameters
          context with request_id
    Returns: HTTP response with territorial divisions data
    '''
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
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        division_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
        
        if division_id:
            cur.execute("SELECT * FROM territorial_divisions WHERE id = %s", (division_id,))
            division = cur.fetchone()
            cur.close()
            conn.close()
            
            if division:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(division), default=str)
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Division not found'})
                }
        else:
            cur.execute("SELECT * FROM territorial_divisions ORDER BY created_at DESC")
            divisions = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps([dict(d) for d in divisions], default=str)
            }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        name = body_data.get('name', '')
        camera_count = body_data.get('camera_count', 0)
        parent_id = body_data.get('parent_id')
        color = body_data.get('color', 'bg-blue-500')
        
        if not name:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Name is required'})
            }
        
        cur.execute(
            "INSERT INTO territorial_divisions (name, camera_count, parent_id, color) VALUES (%s, %s, %s, %s) RETURNING *",
            (name, camera_count, parent_id, color)
        )
        new_division = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(dict(new_division), default=str)
        }
    
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
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'ID is required'})
            }
        
        cur.execute(
            "UPDATE territorial_divisions SET name = %s, camera_count = %s, parent_id = %s, color = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
            (name, camera_count, parent_id, color, division_id)
        )
        updated_division = cur.fetchone()
        conn.commit()
        
        if updated_division:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(dict(updated_division), default=str)
            }
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Division not found'})
            }
    
    if method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        division_id = body_data.get('id')
        
        if not division_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'ID is required'})
            }
        
        cur.execute("DELETE FROM territorial_divisions WHERE id = %s RETURNING id", (division_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if deleted:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'id': deleted['id']})
            }
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Division not found'})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }