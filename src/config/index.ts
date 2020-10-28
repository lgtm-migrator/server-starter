import { forEach } from "@newdash/newdash/forEach";
import xsenv from "@sap/xsenv";

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
    // load config from 'default-env.json'
    xsenv.loadEnv();
  }

  public get(key: string): any {
    if (this._store.has(key)) { return this._store.get(key); }
    // fallback to xs env
    return xsenv.filterServices({ tag: key })[0];
  }

}

