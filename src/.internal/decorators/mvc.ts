import { createInjectDecorator, getUnProxyTarget, InjectContainer } from "@newdash/inject";
import forEach from "@newdash/newdash/forEach";
import express from "express";
import "reflect-metadata";
import { Configuration } from "../../config";
import { InjectType } from "../../constants";
import { FeatureFlagService } from "../../services/FeatureFlagService";
import { getFeatureValue } from "./feature";
import { checkPermission } from "./permission";

const KEY_METHOD_HTTP_METHOD = "controller:method:http_method"
const KEY_METHOD_PATH = "controller:method:path"


export type HTTPMethod = 'get' | 'post' | 'patch' | 'delete' | 'put'

export function path(p: string) {
  return function (target, targetKey) {
    Reflect.defineMetadata(KEY_METHOD_PATH, p, target, targetKey)
  }
}

export function getPath(target, targetKey?) {
  target = getUnProxyTarget(target)
  return Reflect.getMetadata(KEY_METHOD_PATH, target, targetKey)
}

export function method(m: HTTPMethod, p?: string) {
  return function (target, targetKey) {
    Reflect.defineMetadata(KEY_METHOD_HTTP_METHOD, m, target, targetKey)
    if (p != undefined) {
      path(p)(target, targetKey)
    }
  }
}

export function getMethod(target, targetKey) {
  target = getUnProxyTarget(target)
  return Reflect.getMetadata(KEY_METHOD_HTTP_METHOD, target, targetKey)
}


export const Get = (path?: string) => method('get', path)
export const Post = (path?: string) => method('post', path)
export const Put = (path?: string) => method('put', path)
export const Patch = (path?: string) => method('patch', path)
export const Delete = (path?: string) => method('delete', path)

export const InjectRequest = createInjectDecorator(InjectType.Request)

export const InjectResponse = createInjectDecorator(InjectType.Request)

/**
 * create router from controller
 * 
 * @param controller 
 */
export function createRouter(controller) {
  const rt = express.Router()

  forEach(Object.getOwnPropertyNames(getUnProxyTarget(controller).constructor.prototype), (methodName) => {

    const httpMethod = getMethod(controller, methodName)

    // with http method decorator
    // means it's an exported api
    if (httpMethod) {

      let requestPath = getPath(controller, methodName)

      if (requestPath == undefined) {
        requestPath = '/'
      }

      const handler: express.Handler = async (req, res, next) => {

        const c: InjectContainer = res.locals.container

        try {
          const uaaConfig: any = await (await c.getInstance(Configuration)).get("xsuaa")

          if (uaaConfig !== undefined) {
            checkPermission(
              getUnProxyTarget(controller),
              methodName,
              req.session.user,
              uaaConfig.credentials
            )
          }

          const featureValue = getFeatureValue(getUnProxyTarget(controller), methodName)

          if (featureValue !== undefined) {
            const fs = await c.getWrappedInstance(FeatureFlagService);

            if (featureValue.tenant === true) {
              const evaluatedValue = await fs.evaluate(
                featureValue.flag,
              )
              if (evaluatedValue !== featureValue.value) {
                return next()
              }
            } else if (featureValue.user === true) {
              const evaluatedValue = await fs.userAwareEvaluate(
                featureValue.flag,
              )
              if (evaluatedValue !== featureValue.value) {
                return next()
              }
            }

          }

          let rt = await c.injectExecute(controller, controller[methodName])

          if (rt !== undefined) {
            if (rt instanceof Promise) {
              rt = await rt
            }
            const tx = await c.getInstance(InjectType.ODataTransaction)
            // auto commit
            if (tx !== undefined) { await tx.commit(); }
            if (!res.writableEnded) {
              res.json(rt)
            }
          }

        } catch (error) {
          next(error)
        }
      }

      rt[httpMethod](requestPath, handler)
    }
  })

  const ctPath = getPath(controller.constructor)
  if (ctPath) {
    const wrap = express.Router()
    wrap.use(ctPath, wrap)
    return wrap
  }
  return rt
}