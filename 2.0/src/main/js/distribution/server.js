//

import Module from './module';

export default class Server {
  id ;

  name ;

  description ;

  icon ;

  version ;

  address ;

  minecraftVersion ;

  mainServer ;

  autoconnect ;

  modules ;

  constructor(json) {
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

  resolveModules(json) {
    const arr = [];

    json.forEach((mod) => arr.push(new Module(this.id, mod)));

    this.modules = arr;
  }
}
