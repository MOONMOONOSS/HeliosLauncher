// @flow

import Module from './module';

export default class Server {
  id: string;

  name: string;

  description: string;

  icon: string;

  version: string;

  address: string;

  minecraftVersion: string;

  mainServer: boolean;

  autoconnect: boolean;

  modules: Array<Module>;

  constructor(json: any) {
    if (!json) {
      throw new Error('Cannot construct class Server without an object!');
    }

    this.id = json.id;
    this.name = json.name;
    this.description = json.description;
    this.icon = json.icon;
    this.version = json.version;
    this.address = json.address;
    this.minecraftVersion = json.minecraftVersion;
    this.mainServer = json.mainServer;
    this.autoconnect = json.autoconnect;

    this.resolveModules(json.modules);
  }

  resolveModules(json: any): void {
    const arr: Array<Module> = [];

    json.forEach((mod) => new Module(this.id, mod));

    this.modules = arr;
  }
}
