"""
Twisted-based simple seeder/signaling helper.
This small WebSocket server accepts JSON messages with {type: 'join', room: 'name'} and broadcasts 'peer-joined', 'signal', 'peer-left' events.
Requires: twisted, autobahn
Run: pip install -r requirements.txt
      python twisted_seeder.py
"""

from autobahn.twisted.websocket import WebSocketServerProtocol, WebSocketServerFactory
from twisted.internet import reactor
import json

class SeederProtocol(WebSocketServerProtocol):
    rooms = {}  # room -> set(protocol)

    def onConnect(self, request):
        print('Client connecting: {}'.format(request.peer))

    def onOpen(self):
        self.room = None
        print('WebSocket connection open')

    def onMessage(self, payload, isBinary):
        if isBinary:
            return
        try:
            data = json.loads(payload.decode('utf8'))
        except Exception as e:
            print('Invalid JSON', e)
            return
        t = data.get('type')
        if t == 'join':
            room = data.get('room', 'default')
            self.room = room
            SeederProtocol.rooms.setdefault(room, set()).add(self)
            # notify peers
            peers = [id(p) for p in SeederProtocol.rooms[room] if p is not self]
            self.sendMessage(json.dumps({'type':'peers','peers':peers}).encode('utf8'))
            for p in SeederProtocol.rooms[room]:
                if p is not self:
                    p.sendMessage(json.dumps({'type':'peer-joined','id': id(self)}).encode('utf8'))
        elif t == 'signal':
            # relay to target id if present else broadcast in room
            target = data.get('target')
            if self.room and self.room in SeederProtocol.rooms:
                if target:
                    for p in SeederProtocol.rooms[self.room]:
                        if id(p) == target:
                            p.sendMessage(json.dumps({'type':'signal','from': id(self), 'payload': data.get('payload')}).encode('utf8'))
                            break
                else:
                    for p in SeederProtocol.rooms[self.room]:
                        if p is not self:
                            p.sendMessage(json.dumps({'type':'signal','from': id(self), 'payload': data.get('payload')}).encode('utf8'))

    def onClose(self, wasClean, code, reason):
        if self.room and self.room in SeederProtocol.rooms:
            SeederProtocol.rooms[self.room].discard(self)
            for p in SeederProtocol.rooms[self.room]:
                p.sendMessage(json.dumps({'type':'peer-left','id': id(self)}).encode('utf8'))
        print('WebSocket connection closed: {}'.format(reason))

if __name__ == '__main__':
    factory = WebSocketServerFactory('ws://0.0.0.0:9003')
    factory.protocol = SeederProtocol
    reactor.listenTCP(9003, factory)
    print('Twisted seeder listening on ws://0.0.0.0:9003')
    reactor.run()
