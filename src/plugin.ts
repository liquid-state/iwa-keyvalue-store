import { App } from '@liquid-state/iwa-core';
import KeyValueStore from "./store";

export interface Config {
  defaultPermissions?: object
}

/** A plugin for iwa-core/App to attach the KeyValue store with configurable default permissions */
class KVPlugin {
  static key = 'keyvalue-store';

  static configure = (customise?: (conf: Config) => Config) => {
    let defaultPermissions = undefined;
    if (customise) {
      defaultPermissions = customise({}).defaultPermissions;
    }
    return new KVPlugin(defaultPermissions);
  }

  constructor(private defaultPermissions?: object) { }

  // Ensure key is available on the instance as well as the Prototype.
  key = KVPlugin.key;
  store: KeyValueStore | null = null;

  use(app: App) {
    if (!this.store) {
      this.store = new KeyValueStore(app.communicator, this.defaultPermissions);
    }
    return this.store;
  }
}

export default KVPlugin;