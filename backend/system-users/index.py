import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление пользователями системы с ролями и группами
    Args: event - HTTP запрос (GET, POST, PUT, DELETE)
          context - контекст выполнения
    Returns: HTTP ответ с данными пользователей
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
            user_id = query_params.get('id') if query_params else None
            
            if user_id:
                cur.execute('''
                    SELECT u.id, u.full_name, u.position, u.email, u.login, u.company, 
                           u.role_id, r.name as role_name,
                           u.user_group_id, ug.name as user_group_name,
                           u.camera_group_id, cg.name as camera_group_name,
                           u.work_phone, u.mobile_phone, u.note, u.attached_files,
                           u.is_online, u.last_login, u.created_at, u.updated_at
                    FROM system_users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN user_groups ug ON u.user_group_id = ug.id
                    LEFT JOIN camera_groups cg ON u.camera_group_id = cg.id
                    WHERE u.id = %s
                ''', (user_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                columns = [desc[0] for desc in cur.description]
                result = dict(zip(columns, row))
                
                for date_field in ['last_login', 'created_at', 'updated_at']:
                    if result.get(date_field):
                        result[date_field] = result[date_field].isoformat()
            else:
                cur.execute('''
                    SELECT u.id, u.full_name, u.position, u.email, u.login, u.company, 
                           u.role_id, r.name as role_name,
                           u.user_group_id, ug.name as user_group_name,
                           u.camera_group_id, cg.name as camera_group_name,
                           u.work_phone, u.mobile_phone, u.note, u.attached_files,
                           u.is_online, u.last_login, u.created_at, u.updated_at
                    FROM system_users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN user_groups ug ON u.user_group_id = ug.id
                    LEFT JOIN camera_groups cg ON u.camera_group_id = cg.id
                    ORDER BY u.created_at DESC
                ''')
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                result = []
                
                for row in rows:
                    user = dict(zip(columns, row))
                    for date_field in ['last_login', 'created_at', 'updated_at']:
                        if user.get(date_field):
                            user[date_field] = user[date_field].isoformat()
                    result.append(user)
            
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
            
            required_fields = ['full_name', 'email', 'login', 'password']
            for field in required_fields:
                if not body.get(field):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'{field} is required'}),
                        'isBase64Encoded': False
                    }
            
            password_hash = hash_password(body['password'])
            
            cur.execute('''
                INSERT INTO system_users 
                (full_name, position, email, login, password_hash, company, role_id, 
                 user_group_id, camera_group_id, work_phone, mobile_phone, 
                 note, attached_files, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, full_name, position, email, login, company, role_id, 
                          user_group_id, camera_group_id, work_phone, mobile_phone,
                          note, attached_files, is_online, last_login, created_at, updated_at
            ''', (
                body['full_name'],
                body.get('position'),
                body['email'],
                body['login'],
                password_hash,
                body.get('company'),
                body.get('role_id'),
                body.get('user_group_id'),
                body.get('camera_group_id'),
                body.get('work_phone'),
                body.get('mobile_phone'),
                body.get('note'),
                body.get('attached_files'),
                datetime.utcnow(),
                datetime.utcnow()
            ))
            
            row = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            
            for date_field in ['last_login', 'created_at', 'updated_at']:
                if result.get(date_field):
                    result[date_field] = result[date_field].isoformat()
            
            cur.execute('SELECT name FROM roles WHERE id = %s', (result.get('role_id'),))
            role_row = cur.fetchone()
            result['role_name'] = role_row[0] if role_row else None
            
            cur.execute('SELECT name FROM user_groups WHERE id = %s', (result.get('user_group_id'),))
            ug_row = cur.fetchone()
            result['user_group_name'] = ug_row[0] if ug_row else None
            
            cur.execute('SELECT name FROM camera_groups WHERE id = %s', (result.get('camera_group_id'),))
            cg_row = cur.fetchone()
            result['camera_group_name'] = cg_row[0] if cg_row else None
            
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
            user_id = query_params.get('id') if query_params else None
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User ID is required'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            
            updates = []
            values = []
            
            allowed_fields = {
                'full_name': 'full_name',
                'position': 'position',
                'email': 'email',
                'login': 'login',
                'company': 'company',
                'role_id': 'role_id',
                'user_group_id': 'user_group_id',
                'camera_group_id': 'camera_group_id',
                'work_phone': 'work_phone',
                'mobile_phone': 'mobile_phone',
                'note': 'note',
                'attached_files': 'attached_files',
                'is_online': 'is_online'
            }
            
            for field, db_field in allowed_fields.items():
                if field in body:
                    updates.append(f'{db_field} = %s')
                    values.append(body[field])
            
            if 'password' in body and body['password']:
                updates.append('password_hash = %s')
                values.append(hash_password(body['password']))
            
            updates.append('updated_at = %s')
            values.append(datetime.utcnow())
            values.append(user_id)
            
            cur.execute(f'''
                UPDATE system_users 
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, full_name, email, login, company, role_id, 
                          user_group_id, camera_group_id, work_phone, mobile_phone,
                          is_online, last_login, created_at, updated_at
            ''', values)
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            columns = [desc[0] for desc in cur.description]
            result = dict(zip(columns, row))
            
            for date_field in ['last_login', 'created_at', 'updated_at']:
                if result.get(date_field):
                    result[date_field] = result[date_field].isoformat()
            
            cur.execute('SELECT name FROM roles WHERE id = %s', (result.get('role_id'),))
            role_row = cur.fetchone()
            result['role_name'] = role_row[0] if role_row else None
            
            cur.execute('SELECT name FROM user_groups WHERE id = %s', (result.get('user_group_id'),))
            ug_row = cur.fetchone()
            result['user_group_name'] = ug_row[0] if ug_row else None
            
            cur.execute('SELECT name FROM camera_groups WHERE id = %s', (result.get('camera_group_id'),))
            cg_row = cur.fetchone()
            result['camera_group_name'] = cg_row[0] if cg_row else None
            
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
            user_id = query_params.get('id') if query_params else None
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('DELETE FROM system_users WHERE id = %s RETURNING id', (user_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User deleted successfully'}),
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