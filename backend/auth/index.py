"""
Модуль авторизации пользователей
Проверяет логин и пароль в базе данных system_users
"""

import json
import os
import hashlib
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor


def hash_password(password: str) -> str:
    """Хэширование пароля SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Авторизация пользователя по логину и паролю
    Args: event - dict с httpMethod, body
          context - объект с request_id
    Returns: HTTP response dict с данными пользователя или ошибкой
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        login = body_data.get('login', '').strip()
        password = body_data.get('password', '').strip()
        
        if not login or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT id, full_name, email, login, role_id, user_group_id, 
                   camera_group_id, company, position
            FROM t_p76735805_video_surveillance_s.system_users 
            WHERE login = %s AND password_hash = %s
        """
        
        cur.execute(query, (login, password_hash))
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Некорректный логин и/или пароль'}),
                'isBase64Encoded': False
            }
        
        update_query = """
            UPDATE t_p76735805_video_surveillance_s.system_users 
            SET last_login = NOW(), is_online = true 
            WHERE id = %s
        """
        cur.execute(update_query, (user['id'],))
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'user': dict(user)
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
