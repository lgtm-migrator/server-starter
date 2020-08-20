import { forEach } from "@newdash/newdash/forEach";

export class Configuration {

  private _store: Map<string, string>

  constructor(options: Record<string, any>) {
    this._store = new Map();
    forEach(options, (value, key) => {
      if (value != undefined) {
        if (typeof value == 'string') {
          this._store.set(key, value);
        } else {
          this._store.set(key, String(value));
        }
      }
    });
  }

  public get(key: string): string {
    return this._store.get(key);
  }

}

