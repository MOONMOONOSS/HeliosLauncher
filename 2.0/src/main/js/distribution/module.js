import path from 'path';

import Artifact from './artifact';
import Required from './required';
import Types from './types';

// Fucking webpack
let app;
if (!process.env.CONFIG_DIRECT_PATH) {
  app = require('electron').app;
}

/**
 * Represents a Module containing Artifacts to download
 *
 * @requires Required
 * @requires Artifact
 * @requires Types
 * @export
 * @class Module
 */
export default class Module {
  artifact;

  artifactVersion;

  artifactId;

  artifactGroup;

  id;

  name;

  required;

  subModules;

  type;

  extension;

  /**
   * Resolve the default extension for a specific module type.
   *
   * @static
   * @private
   * @requires Types
   * @param {string} type
   * @returns {string} The default extension for a given type.
   * Will be null if a type does not have a default extension.
   * @memberof Module
   */
  static resolveExtension(type) {
    switch (type) {
      case Types.Library:
      case Types.ForgeHosted:
      case Types.FabricHosted:
      case Types.FabricMod:
      case Types.ForgeMod:
        return 'jar';
      case Types.File:
      default:
        return '';
    }
  }

  /**
   * Creates an instance of Module.
   * @param {Object} json A Json object representing a Module.
   * @param {string} serverId The ID of the server to which this module belongs.
   * @memberof Module
   */
  constructor(serverId, json) {
    if (json) {
      this.id = json.id;
      this.type = json.type;
      this.resolveMetadata();
      this.name = json.name;
      this.required = new Required(json.required);

      this.artifact = new Artifact(json.artifact);

      this.resolveArtifactPath(serverId);
      this.resolveSubModules(json.subModules, serverId);
    }
  }

  /**
   * TODO: Figure what the hell this does
   *
   * @private
   * @memberof Module
   */
  resolveMetadata() {
    try {
      const m0 = this.id.split('@');

      const m1 = m0[0].split(':');

      this.extension = m0[1] || Module.resolveExtension(this.type);

      this.artifactVersion = m1[2] || null;
      this.artifactId = m1[1] || null;
      this.artifactGroup = m1[0] || null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Improper ID for module', this.id, err);
    }
  }

  resolveArtifactPath(serverId) {
    let pth;

    if (this.type === Types.File) {
      pth = this.artifact.path;
    } else {
      pth = path.join(
        ...this.artifactGroup.split('.'),
        this.artifactId,
        this.artifactVersion,
        `${this.artifactId}-${this.artifactVersion}.${this.extension}`,
      );
    }

    switch (this.type) {
      case Types.Library:
      case Types.ForgeHosted:
      case Types.FabricHosted:
        this.artifact.path = path.join(
          process.env.CONFIG_DIRECT_PATH || app.getPath('appData'),
          'common',
          'libraries',
          pth,
        );
        break;
      case Types.ForgeMod:
      case Types.FabricMod:
        this.artifact.path = path.join(
          process.env.CONFIG_DIRECT_PATH || app.getPath('appData'),
          'common',
          'modstore',
          pth,
        );
        break;
      case Types.VersionManifest:
        this.artifact.path = path.join(
          process.env.CONFIG_DIRECT_PATH || app.getPath('appData'),
          'common',
          'versions',
          String(this.artifactId), `${String(this.artifactId)}.json`,
        );
        break;
      case Types.File:
      default:
        this.artifact.path = path.join(
          process.env.CONFIG_DIRECT_PATH || app.getPath('appData'),
          'instances',
          serverId,
          pth,
        );
    }
  }

  resolveSubModules(json, serverId) {
    const arr = [];

    if (json) {
      json.forEach((sm) => arr.push(new Module(serverId, sm)));
    }

    this.subModules = arr;
  }

  hasSubModules() {
    return (this.subModules.length !== 0);
  }

  versionlessId() {
    return `${this.artifactGroup}:${this.id}`;
  }

  extensionlessId() {
    return this.id.split('@')[0];
  }
}
