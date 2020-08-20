import { inject } from "@newdash/inject";
import { Get } from "../.internal";
import { Configuration } from "../config";

export class IndexController {

  @Get()
  index(@inject(Configuration) config: Configuration) {
    return {
      service: config.get("SERVER_NAME"),
    };
  }

  @Get("/status")
  status() {
    return {
      status: 200
    };
  }


  @Get("/error")
  error() {
    throw new Error("an example error");
  }


}
