/* eslint-disable no-control-regex */
import Net from 'net';

export default class Minecraft {
  constructor(address, port) {
    if (port && port !== '') {
      this.port = parseInt(port, 10);
    } else {
      this.port = 25565;
    }

    this.address = address;
  }

  getStatus() {
    return new Promise((resolve, reject) => {
      const socket = Net.connect(this.port, this.address, () => {
        const buff = Buffer.from([0xFE, 0x01]);
        socket.write(buff);
      });

      socket.setTimeout(2500, () => {
        socket.end();

        reject(Error({
          code: 'ETIMEDOUT',
          errno: 'ETIMEDOUT',
          address: this.address,
          port: this.port,
        }));
      });

      socket.on('data', (data) => {
        if (data && data !== '') {
          const serverInfo = String(data).split('\x00\x00\x00');
          const NUM_FIELDS = 6;

          if (serverInfo && serverInfo.length >= NUM_FIELDS) {
            resolve({
              online: true,
              address: this.address,
              port: this.port,
              version: serverInfo[2].replace(/\u0000/g, ''),
              motd: serverInfo[3].replace(/\u0000/g, ''),
              onlinePlayers: serverInfo[4].replace(/\u0000/g, ''),
              maxPlayers: serverInfo[5].replace(/\u0000/g, ''),
            });
          } else {
            resolve({
              online: false,
            });
          }
        }

        socket.end();
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }
}
