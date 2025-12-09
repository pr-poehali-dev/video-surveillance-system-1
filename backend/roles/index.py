import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление ролями пользователей с правами доступа
    Args: event - HTTP запрос (GET, POST, PUT, DELETE)
          context - контекст выполнения
    Returns: HTTP ответ с данными ролей
    '''
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
    
    try:
        dsn = os.environ['DATABASE_URL']
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            role_id = query_params.get('id') if query_params else None
            
            if role_id:
                cur.execute('''
                    SELECT id, name, description, permissions, created_at, updated_at,
                           (SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = roles.id) as users_count
                    FROM t_p76735805_video_surveillance_s.roles 
                    WHERE id = %s
                ''', (role_id,))
            else:
                cur.execute('''
                    SELECT id, name, description, permissions, created_at, updated_at,
                           (SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = roles.id) as users_count
                    FROM t_p76735805_video_surveillance_s.roles
                    ORDER BY created_at DESC
                ''')
            
            columns = [desc[0] for desc in cur.description]
            
            if role_id:
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Role not found'}),
                        'isBase64Encoded': False
                    }
                result = dict(zip(columns, row))
                result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
                result['updated_at'] = result['updated_at'].isoformat() if result['updated_at'] else None
            else:
                rows = cur.fetchall()
                result = []
                for row in rows:
                    role = dict(zip(columns, row))
                    role['created_at'] = role['created_at'].isoformat() if role['created_at'] else None
                    role['updated_at'] = role['updated_at'].isoformat() if role['updated_at'] else None
                    result.append(role)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            description = body.get('description', '')
            permissions = body.get('permissions', {})
            
            if not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO t_p76735805_video_surveillance_s.roles (name, description, permissions, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, description, permissions, created_at, updated_at
            ''', (name, description, json.dumps(permissions), datetime.utcnow(), datetime.utcnow()))
            
            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            result['users_count'] = 0
            result['created_at'] = result['created_at'].isoformat()
            result['updated_at'] = result['updated_at'].isoformat()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            query_params = event.get('queryStringParameters', {})
            role_id = query_params.get('id') if query_params else None
            
            if not role_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Role ID is required'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            description = body.get('description')
            permissions = body.get('permissions')
            
            updates = []
            values = []
            
            if name is not None:
                updates.append('name = %s')
                values.append(name)
            if description is not None:
                updates.append('description = %s')
                values.append(description)
            if permissions is not None:
                updates.append('permissions = %s')
                values.append(json.dumps(permissions))
            
            updates.append('updated_at = %s')
            values.append(datetime.utcnow())
            values.append(role_id)
            
            cur.execute(f'''
                UPDATE t_p76735805_video_surveillance_s.roles 
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, name, description, permissions, created_at, updated_at
            ''', values)
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Role not found'}),
                    'isBase64Encoded': False
                }
            
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            result['created_at'] = result['created_at'].isoformat()
            result['updated_at'] = result['updated_at'].isoformat()
            
            cur.execute('SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = %s', (role_id,))
            result['users_count'] = cur.fetchone()[0]
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            role_id = query_params.get('id') if query_params else None
            
            if not role_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Role ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('SELECT COUNT(*) FROM t_p76735805_video_surveillance_s.system_users WHERE role_id = %s', (role_id,))
            users_count = cur.fetchone()[0]
            
            if users_count > 0:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Cannot delete role with {users_count} assigned users'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('DELETE FROM t_p76735805_video_surveillance_s.roles WHERE id = %s RETURNING id', (role_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Role not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Role deleted successfully'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }