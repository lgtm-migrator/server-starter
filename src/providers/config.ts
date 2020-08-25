import { noWrap, provider } from "@newdash/inject";
import { register } from "../.internal";
import { Configuration } from "../config";

@register
export class ConfigurationProvider {

  @provider(Configuration)
  @noWrap
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