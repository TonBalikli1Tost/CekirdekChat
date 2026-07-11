#!/usr/bin/env python3
"""
Lightweight WebSocket signaling server (fallback) using `websockets` library.
Accepts JSON messages: {type:'join', room:'name'} and {type:'signal', target, payload}
"""
import asyncio
import json
import os
import logging
from websockets import serve

logging.basicConfig(level=logging.INFO)

ROOMS = {}

async def handler(ws, path):
    logging.info('Client connected')
    room = None
    try:
        async for msg in ws:
            try:
                d = json.loads(msg)
            except Exception as e:
                logging.warning('invalid json: %s', e)
                continue
            t = d.get('type')
            if t == 'join':
                room = d.get('room', 'default')
                ROOMS.setdefault(room, set()).add(ws)
                peers = [id(p) for p in ROOMS[room] if p is not ws]
                await ws.send(json.dumps({'type':'peers','peers':peers}))
                for p in list(ROOMS[room]):
                    if p is not ws:
                        await p.send(json.dumps({'type':'peer-joined','id': id(ws)}))
            elif t == 'signal':
                target = d.get('target')
                if room and room in ROOMS:
                    if target:
                        for p in ROOMS[room]:
                            if id(p) == target:
                                await p.send(json.dumps({'type':'signal','from': id(ws), 'payload': d.get('payload')}))
                                break
                    else:
                        for p in ROOMS[room]:
                            if p is not ws:
                                await p.send(json.dumps({'type':'signal','from': id(ws), 'payload': d.get('payload')}))
    finally:
        if room and room in ROOMS:
            ROOMS[room].discard(ws)
            for p in ROOMS[room]:
                await p.send(json.dumps({'type':'peer-left','id': id(ws)}))
        logging.info('Client disconnected')

if __name__ == '__main__':
    port = int(os.environ.get('SIGNAL_PORT', '9003'))
    logging.info('Starting signaling server on :%d', port)
    asyncio.run(serve(handler, '0.0.0.0', port))
