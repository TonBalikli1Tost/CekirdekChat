from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor

class CekirdekServer(DatagramProtocol):
    def __init__(self):
        self.clients = []

    def datagramReceived(self, datagram, addr):
        try:
            message = datagram.decode('utf-8').strip()
        except Exception:
            return

        if message == 'ready':
            if addr not in self.clients:
                self.clients.append(addr)

            seed_peers = [f'{peer[0]}:{peer[1]}' for peer in self.clients if peer != addr]
            self.transport.write('\n'.join(seed_peers).encode('utf-8'), addr)

if __name__ == '__main__':
    print('Çekirdek Seeding Sunucusu Başlatıldı...')
    reactor.listenUDP(9999, CekirdekServer())
    reactor.run()
