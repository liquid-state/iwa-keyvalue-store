import { ICommunicator } from '@liquid-state/iwa-core/dist/communicator';
import { Messages } from '@liquid-state/iwa-core';
import Key, { Value, KeyPermissions } from './key';

export default class KeyValueStore {
  constructor(private communicator: ICommunicator, private defaultPermissions?: KeyPermissions) {}

  get(key: string): Promise<Key> {
    return this.communicator.send(Messages.kv.get([key]))
      .then(response => {
        const value = response[key].found ? response[key].value : null;
        return new Key(key, value);
      });
  }

  set(key: Key): void {
    const keyData = key.prepareForSave();
    if (keyData.useDefaultPermissions && this.defaultPermissions) {
      keyData.data.permissions = this.defaultPermissions;
    }
    this.communicator.send(Messages.kv.set([keyData.data]));
  }

  create(key: string, value: Value) {
    return new Key(key, value);
  };
}
