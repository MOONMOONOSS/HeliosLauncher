// @flow

import Server from './server';

export default class DistroIndex {
  mainServerId: ?string;

  rss: string;

  servers: Array<Server>;

  version: string;

  constructor(json: any) {
    if (!json) {
      throw new Error('Cannot construct class DistroIndex without an object!');
    }

    this.rss = json.rss;
    this.version = json.version;

    this.resolveServers(json.servers);
  }

  resolveServers(servers: any): void {
    const arr: Array<Server> = [];
    let declared: boolean = false;

    servers.forEach((server) => {
      if (server.mainServer) {
        this.mainServerId = server.id;
        declared = true;
      }

      arr.push(new Server(server));
    });

    // Default main server is first in array
    if (!declared && arr.length !== 0) {
      this.mainServerId = arr[0].id;
    }

    this.servers = arr;
  }

  getServer(id: string): Server {
    const serv = this.servers.find((server) => server.id === id);

    if (serv) {
      return serv;
    }

    throw new Error(`Couldn't find server with ID of ${id}`);
  }

  get mainServer(): Server {
    if (this.mainServerId) {
      return this.getServer(String(this.mainServerId));
    }

    throw new Error('No servers exist! How???');
  }
}
