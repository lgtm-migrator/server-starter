import { inject, noWrap } from "@newdash/inject";
import { TTLCacheProvider } from "@newdash/newdash/cacheProvider";
import { toHashCode } from "@newdash/newdash/functional/toHashCode";
import got from "got";
import { withConfigValue } from "../.internal/decorators/config";
import { FeatureFlagEnv } from "../.internal/types";
import { InjectType } from "../constants";


export class FeatureFlagService {

  @noWrap
  @withConfigValue("feature-flags")
  private config: FeatureFlagEnv

  @noWrap
  private cache = new TTLCacheProvider(5 * 1000, 1000) // cache with some seconds

  private async getFeatureFlagValue(flag: string, id: string) {

    if (this.config === undefined) {
      return undefined;
    }

    const url = `${this.config.credentials.uri}/api/v2/evaluate/${flag}?identifier=${id}`;

    const res = await got(url, {
      headers: {
        "Authorization": "Basic " + Buffer
          .from(`${this.config.credentials.username}:${this.config.credentials.password}`)
          .toString("base64")
      }
    }).json();

    return res['variation'];

  }

  public async evaluate(flag: string, @inject(InjectType.TenantId) tenantId: string) {
    return this.cache.getOrCreate(toHashCode([flag, tenantId]), () => {
      return this.getFeatureFlagValue(flag, tenantId);
    });
  }

  public async userAwareEvaluate(flag: string, @inject(InjectType.UserId) userId: string) {
    return this.cache.getOrCreate(toHashCode([flag, userId]), () => {
      return this.getFeatureFlagValue(flag, userId);
    });
  }


}

