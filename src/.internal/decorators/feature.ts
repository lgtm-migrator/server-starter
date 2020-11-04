import "reflect-metadata";

const KEY_FEATURE = "key:feature-flag:normal"

export interface FeatureValue {
  flag: string;
  /**
   * the expected result value
   */
  value: any;
  user?: boolean;
  tenant?: boolean;
}

export function feature(flag: string, value: boolean | string): MethodDecorator {
  return function (target, targetKey) {
    if (flag !== undefined && value !== undefined) {
      Reflect.defineMetadata(KEY_FEATURE, { flag, tenant: true, value }, target, targetKey)
    }
  }
}

export function userAwareFeature(flag: string, value: boolean | string): MethodDecorator {
  return function (target, targetKey) {
    if (flag !== undefined && value !== undefined) {
      Reflect.defineMetadata(KEY_FEATURE, { flag, user: true, value }, target, targetKey)
    }
  }
}

export function getFeatureValue(target, targetKey): FeatureValue {
  return Reflect.getMetadata(KEY_FEATURE, target, targetKey)
}

export function isFeature(target, targetKey) {
  return Boolean(Reflect.getMetadata(KEY_FEATURE, target, targetKey))
}
