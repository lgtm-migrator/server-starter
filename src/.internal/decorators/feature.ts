import { InjectContainer } from "@newdash/inject";
import "reflect-metadata";
import { FeatureFlagService } from "../../services/FeatureFlagService";

const KEY_FEATURE = "key:feature-flag:normal";

export interface FeatureValue {
  flag: string;
  /**
   * the expected result value
   */
  value: any;
  user?: boolean;
  tenant?: boolean;
}

export function feature(
  flag: string,
  value: boolean | string,
): MethodDecorator {
  return function (target, targetKey) {
    if (flag !== undefined && value !== undefined) {
      Reflect.defineMetadata(
        KEY_FEATURE,
        { flag, tenant: true, value },
        target,
        targetKey,
      );
    }
  };
}

export function userAwareFeature(
  flag: string,
  value: boolean | string,
): MethodDecorator {
  return function (target, targetKey) {
    if (flag !== undefined && value !== undefined) {
      Reflect.defineMetadata(
        KEY_FEATURE,
        { flag, user: true, value },
        target,
        targetKey,
      );
    }
  };
}

export function getFeatureValue(target, targetKey): FeatureValue {
  return Reflect.getMetadata(KEY_FEATURE, target, targetKey);
}

export function isFeature(target, targetKey) {
  return Boolean(Reflect.getMetadata(KEY_FEATURE, target, targetKey));
}

export async function isEnabledFeature(controller: any, methodName: string, ic: InjectContainer): Promise<boolean> {
  const featureValue = getFeatureValue(
    controller,
    methodName,
  );

  if (featureValue !== undefined) {
    const fs = await ic.getWrappedInstance(FeatureFlagService);
    if (featureValue.tenant === true) {
      const evaluatedValue = await fs.evaluate(
        featureValue.flag,
      );
      if (evaluatedValue !== featureValue.value) {
        return false;
      }
    } else if (featureValue.user === true) {
      const evaluatedValue = await fs.userAwareEvaluate(
        featureValue.flag,
      );
      if (evaluatedValue !== featureValue.value) {
        return false;
      }
    }
  }

  return true;
}
