export type Value =
  | string
  | object
  | any[]
  | null

export type KeyPermissions = {
  read_only: Permission[],
  read_write: Permission[]
}

export type Permission = {
  type: PermissionType,
  id: string
}

export type PermissionType =
  | 'iwa'
  | 'native'

const emptyPermissions = (): KeyPermissions => ({
  read_only: [],
  read_write: []
});

export default class Key {
  private permissions: KeyPermissions;
  // This is true unless the constructor does not get any permissions passed.
  private permissionsHaveBeenSet = true;

  constructor(public key: string, public value: Value, permissions?: KeyPermissions) {
    if (!permissions) {
      permissions = emptyPermissions();
      this.permissionsHaveBeenSet = false;
    }
    this.permissions = permissions;
  }

  /** Returns a new Key with the updated value */
  update(newValue: Value) {
    return new Key(this.key, newValue, this.permissions);
  }

  /** Returns a new Key with the value set to null */
  unset() {
    return new Key(this.key, null, this.permissions);
  }

  /** Tries to decode the current value from a string into a JSON object or array */
  decodeValue() {
    if (typeof this.value === "string") {
      return JSON.parse(this.value);
    }
    return this.value;
  }

  /** Encodes the value into JSON */
  encodeValue() {
    if (typeof this.value === "string") {
      return this.value;
    }
    if (this.value === null) {
      // JSON.stringify(null) === "null" which is not what we want.
      return null;
    }
    return JSON.stringify(this.value);
  }

  prepareForSave() {
    return {
      useDefaultPermissions: !this.permissionsHaveBeenSet,
      data: {
        key: this.key,
        value: this.encodeValue(),
        permissions: this.permissions
      } as any
    };
  }

  addReadPermission(type: PermissionType, id: string) {
    this.permissionsHaveBeenSet = true;
    if (this.permissionExists(this.permissions.read_only, type, id)) {
      return this;
    }
    this.permissions.read_only.push({ type, id });
    return this;
  }

  addWritePermission(type: PermissionType, id: string) {
    this.permissionsHaveBeenSet = true;
    if (this.permissionExists(this.permissions.read_write, type, id)) {
      return this;
    }
    this.permissions.read_write.push({ type, id });
    return this;
  }

  removeReadPermission(type: PermissionType, id: string) {
    this.permissionsHaveBeenSet = true;
    this.permissions.read_only = this.permissions.read_only.filter(p => p.type !== type || p.id !== id);
    return this;
  }

  removeWritePermission(type: PermissionType, id: string) {
    this.permissionsHaveBeenSet = true;
    this.permissions.read_write = this.permissions.read_write.filter(p => p.type !== type || p.id !== id);
    return this;
  }

  clearPermissions() {
    this.permissionsHaveBeenSet = true;
    this.permissions = emptyPermissions();
    return this;
  }

  private permissionExists(array: Permission[], type: PermissionType, id: string): boolean {
    return array.some(p => p.type === type && p.id === id);
  }
}
