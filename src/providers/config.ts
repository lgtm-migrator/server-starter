import { provider } from "@newdash/inject";
import { Configuration } from "../config";

export class ConfigurationProvider {

  @provider(Configuration)
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