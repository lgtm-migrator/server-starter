import { inject, InjectContainer, withType } from "@newdash/inject";
import fs from "fs";
import path from "path";
import { register } from "../.internal";
import { InjectType } from "../constants";


@register
export class ServicesProvider {

  @inject()
  container: InjectContainer;

  @withType(InjectType.Services)
  async provide() {
    const rt = [];
    const items = fs.readdirSync(path.join(__dirname, "../services"));

    for (const item of items) {
      if (item.endsWith(".js") || item.endsWith(".ts")) {
        const itemPath = path.join(__dirname, "../services", item);
        const moduleObject = await import(itemPath);
        if (moduleObject.default !== undefined) {
          rt.push(await this.container.getParent().getWrappedInstance(moduleObject.default));
        } else {
          for (const key in moduleObject) {
            if (Object.prototype.hasOwnProperty.call(moduleObject, key)) {
              const propertyValue = moduleObject[key];
              rt.push(await this.container.getParent().getWrappedInstance(propertyValue));
            }
          }
        }
      }
    }

    return rt;

  }

}