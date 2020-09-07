import { createInjectDecorator, inject, InjectContainer, withType } from "@newdash/inject";
import fs from "fs";
import path from "path";
import { register } from "../.internal";
import { InjectType } from "../constants";


@register
export class ControllersProvider {

  @inject()
  container: InjectContainer;

  @withType(InjectType.Controllers)
  async provide() {
    const rt = [];
    const items = fs.readdirSync(path.join(__dirname, "../controllers"));

    for (const item of items) {
      const itemPath = path.join(__dirname, "../controllers", item);
      const moduleObject = await import(itemPath);
      if (moduleObject.default !== undefined) {
        rt.push(await this.container.getWrappedInstance(moduleObject.default));
      } else {
        for (const key in moduleObject) {
          if (Object.prototype.hasOwnProperty.call(moduleObject, key)) {
            const propertyValue = moduleObject[key];
            rt.push(await this.container.getWrappedInstance(propertyValue));
          }
        }
      }
    }

    return rt;
  }

}

export const injectControllers = createInjectDecorator(InjectType.Controllers);