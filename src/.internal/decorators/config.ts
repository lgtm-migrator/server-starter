import { inject } from "@newdash/inject";

export function withConfigValue(key: any) {
  return function (target, targetKey, parameterIndex?) {
    inject("configuration:value")(target, targetKey, parameterIndex);
    inject.param("configuration:value_key", key)(target, targetKey, parameterIndex);
  };
}
