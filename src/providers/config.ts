import { inject, noWrap, required, transient, withType } from "@newdash/inject";
import { register } from "../.internal";
import { Configuration } from "../config";

@register
export class ConfigurationProvider {

  @noWrap
  @withType(Configuration)
  async provide() {
    const defaultOpt = await import("../config/default");
    let envOpt = {};
    if (process.env.PROFILE) {
      envOpt = await import(`../config/${process.env.PROFILE}`);
      envOpt['PROFILE'] = process.env.PROFILE;
    }
    const mergedOpt = Object.assign(defaultOpt, envOpt);
    return new Configuration(mergedOpt);
  }

}

@register
export class ConfigurationValueProvider {

  @transient
  @withType("configuration:value")
  provide(
    @required @inject(Configuration) config: Configuration,
    @required @inject("configuration:value_key") key: any
  ) {
    return config.get(key);
  }

}
