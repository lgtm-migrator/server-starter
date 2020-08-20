import { getUnProxyTarget, inject, InjectContainer } from "@newdash/inject";
import forEach from "@newdash/newdash/forEach";
import express from "express";
import "reflect-metadata";
import { InjectType } from "../../constants";

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

export function InjectRequest(target, targetKey, parameterIndex) {
  return inject(InjectType.Request)(target, targetKey, parameterIndex)
}


export function InjectResponse(target, targetKey, parameterIndex) {
  return inject(InjectType.Request)(target, targetKey, parameterIndex)
}

/**
 * create router from controller
 * 
 * @param controller 
 */
export function createRouter(controller, ic: InjectContainer) {
  const rt = express.Router()

  forEach(Object.getOwnPropertyNames(getUnProxyTarget(controller).constructor.prototype), (methodName) => {
    const httpMethod = getMethod(controller, methodName)
    if (httpMethod) {
      let methodPath = getPath(controller, methodName)
      if (methodPath == undefined) {
        methodPath = '/'
      }


      const handler = async (req, res: express.Response, next) => {

        const c = await ic.createSubContainer()
        c.registerInstance(InjectType.Request, req)
        c.registerInstance(InjectType.Response, res)
        c.registerInstance(InjectType.NextFunction, next)

        try {

          let rt = c.injectExecute(controller, controller[methodName])

          if (rt != undefined) {
            if (rt instanceof Promise) {
              rt = await rt
            }
            if (!res.writableEnded) {
              res.json(rt)
            }
          }

        } catch (error) {
          next(error)
        }
      }

      rt[httpMethod](methodPath, handler)
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