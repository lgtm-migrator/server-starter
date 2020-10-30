import createHttpError from "http-errors";
import "reflect-metadata";
import { AccessToken } from "../types";

const KEY_HAS_SCOPE = "permission:scope"
const KEY_HAS_ATTRIBUTE = "permission:attribute"

export function hasScope(scope: string): MethodDecorator {
  return function (target, targetKey) {
    if (scope !== undefined && scope) {
      Reflect.defineMetadata(KEY_HAS_SCOPE, scope, target, targetKey)
    }
  }
}

export function hasAttribute(attrName: string, attrValue: any): MethodDecorator {
  return function (target, targetKey) {
    if (attrName !== undefined && attrValue !== undefined) {
      Reflect.defineMetadata(KEY_HAS_ATTRIBUTE, { attrName, attrValue }, target, targetKey)
    }
  }
}

export function checkPermission(target: any, targetKey: any, jwt: AccessToken, uaaCredential: any) {
  const requiredScope = Reflect.getMetadata(KEY_HAS_SCOPE, target, targetKey)

  const { xsappname } = uaaCredential

  if (requiredScope !== undefined) {
    if (!jwt.scope.includes(`${xsappname}.${requiredScope}`)) {
      throw createHttpError(403, `require the '${requiredScope}' scope`)
    }
  }

  const requiredAttr = Reflect.getMetadata(KEY_HAS_ATTRIBUTE, target, targetKey)
  if (requiredAttr) {
    const { attrName, attrValue } = requiredAttr
    if (
      !(attrName in jwt["xs.user.attributes"]) // not have attr
      || !jwt["xs.user.attributes"][attrName].includes(attrValue) // not have attr value
    ) {
      throw new createHttpError.Forbidden(`require the '${attrValue}' for attribute '${attrName}'`)
    }
  }

}