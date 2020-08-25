import { createInjectDecorator, inject, withType } from "@newdash/inject";
import { register } from "../.internal";
import { InjectType } from "../constants";
import { IndexController } from "../controllers/IndexController";


@register
export class ControllersProvider {

  @inject(IndexController)
  index: IndexController;

  @withType(InjectType.Controllers)
  provide() {
    return [
      this.index
    ];
  }

}

export const injectControllers = createInjectDecorator(InjectType.Controllers);