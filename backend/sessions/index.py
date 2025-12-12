"""
Модуль управления активными сессиями пользователей
Получение, обновление и удаление сессий
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление сессиями пользователей
    GET - получить список активных сессий
    POST - создать/обновить сессию
    DELETE - завершить сессию
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            # Получить все активные сессии (не истекшие)
            cur.execute('''
                SELECT 
                    s.id,
                    s.user_id,
                    s.session_token,
                    s.ip_address,
                    s.user_agent,
                    s.current_route,
                    s.last_activity,
                    s.created_at,
                    u.full_name,
                    u.login,
                    u.email
                FROM t_p76735805_video_surveillance_s.user_sessions s
                JOIN t_p76735805_video_surveillance_s.system_users u ON s.user_id = u.id
                WHERE s.expires_at > NOW()
                ORDER BY s.last_activity DESC
            ''')
            
            sessions = cur.fetchall()
            result = [dict(row) for row in sessions]
            
            print(f"Found {len(result)} sessions in database")
            
            # Преобразуем datetime в строки
            for session in result:
                if session.get('last_activity'):
                    session['last_activity'] = session['last_activity'].isoformat()
                if session.get('created_at'):
                    session['created_at'] = session['created_at'].isoformat()
                print(f"Session: user_id={session.get('user_id')}, full_name={session.get('full_name')}, last_activity={session.get('last_activity')}")
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Создать или обновить сессию
            body_str = event.get('body', '{}')
            if not body_str or body_str.strip() == '':
                body_str = '{}'
            
            try:
                body_data = json.loads(body_str)
            except json.JSONDecodeError:
                body_data = {}
            
            user_id = body_data.get('user_id')
            session_token = body_data.get('session_token')
            ip_address = body_data.get('ip_address', '')
            user_agent = body_data.get('user_agent', '')
            current_route = body_data.get('current_route', '/')
            
            if not user_id or not session_token:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id и session_token обязательны'}),
                    'isBase64Encoded': False
                }
            
            # Экранирование данных
            session_token_escaped = session_token.replace("'", "''")
            ip_escaped = ip_address.replace("'", "''") if ip_address else ''
            user_agent_escaped = user_agent.replace("'", "''") if user_agent else ''
            route_escaped = current_route.replace("'", "''") if current_route else '/'
            
            # Проверяем существующую сессию
            check_query = f"""
                SELECT id FROM t_p76735805_video_surveillance_s.user_sessions 
                WHERE session_token = '{session_token_escaped}'
            """
            cur.execute(check_query)
            existing = cur.fetchone()
            
            if existing:
                # Обновляем существующую сессию
                update_query = f"""
                    UPDATE t_p76735805_video_surveillance_s.user_sessions 
                    SET current_route = '{route_escaped}',
                        last_activity = NOW(),
                        expires_at = NOW() + INTERVAL '24 hours'
                    WHERE session_token = '{session_token_escaped}'
                    RETURNING id
                """
                cur.execute(update_query)
                conn.commit()
                session_id = cur.fetchone()['id']
            else:
                # Создаем новую сессию
                insert_query = f"""
                    INSERT INTO t_p76735805_video_surveillance_s.user_sessions 
                    (user_id, session_token, ip_address, user_agent, current_route, expires_at)
                    VALUES ({user_id}, '{session_token_escaped}', '{ip_escaped}', 
                            '{user_agent_escaped}', '{route_escaped}', NOW() + INTERVAL '24 hours')
                    RETURNING id
                """
                cur.execute(insert_query)
                conn.commit()
                session_id = cur.fetchone()['id']
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'session_id': session_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Завершить сессию
            params = event.get('queryStringParameters', {})
            session_token = params.get('session_token', '')
            
            if not session_token:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'session_token обязателен'}),
                    'isBase64Encoded': False
                }
            
            token_escaped = session_token.replace("'", "''")
            
            # Устанавливаем expires_at в прошлое для завершения сессии
            delete_query = f"""
                UPDATE t_p76735805_video_surveillance_s.user_sessions 
                SET expires_at = NOW() - INTERVAL '1 hour'
                WHERE session_token = '{token_escaped}'
            """
            cur.execute(delete_query)
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
            
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }