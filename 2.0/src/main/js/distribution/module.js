import path from 'path';
import { app } from 'electron'; // eslint-ignore-line

import Artifact from './artifact';
import Required from './required';
import Types from './types';

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
  artifact: Artifact;

  artifactVersion: ?string;

  artifactId: ?string;

  artifactGroup: ?string;

  id: string;

  name: string;

  required: Required;

  subModules: Array<Module>;

  type: string;

  extension: string;

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
  static resolveExtension(type: string): string {
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
  constructor(serverId: string, json: ?any) {
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
  resolveMetadata(): void {
    try {
      const m0: Array<string> = this.id.split('@');

      const m1: Array<string> = m0[0].split(':');

      this.extension = m0[1] || Module.resolveExtension(this.type);

      this.artifactVersion = m1[2] || null;
      this.artifactId = m1[1] || null;
      this.artifactGroup = m1[0] || null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Improper ID for module', this.id, err);
    }
  }

  resolveArtifactPath(serverId: string): void {
    let pth: string;

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
        this.artifact.path = path.join(app.getPath('userData'), 'common', 'libraries', pth);
        break;
      case Types.ForgeMod:
      case Types.FabricMod:
        this.artifact.path = path.join(app.getPath('userData'), 'common', 'modstore', pth);
        break;
      case Types.VersionManifest:
        this.artifact.path = path.join(app.getPath('userData'), 'common', 'versions', String(this.artifactId), `${String(this.artifactId)}.json`);
        break;
      case Types.File:
      default:
        this.artifact.path = path.join(app.getPath('userData'), 'instances', serverId, pth);
    }
  }

  resolveSubModules(json: ?any, serverId: string): void {
    const arr: Array<Module> = [];

    if (json) {
      json.forEach((sm) => arr.push(new Module(serverId, sm)));
    }

    this.subModules = arr;
  }
}
