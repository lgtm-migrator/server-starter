import { inject } from "@newdash/inject";
import { InjectType } from "../../constants";


export function withODataService(entityType) {
  return function (target, targetKey, parameterIndex?) {
    inject.param(InjectType.ODataServiceType, entityType)(target, targetKey, parameterIndex);
    inject(InjectType.ODataService)(target, targetKey, parameterIndex);
  };
}