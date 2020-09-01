import { inject, InjectWrappedInstance } from "@newdash/inject";
import { TypedService } from "@odata/server";
import { Request } from "express";
import { Get, InjectRequest, withODataService } from "../.internal";
import { Configuration } from "../config";
import { People } from "../models/People";

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

  @Get("/count")
  count(@InjectRequest req: Request) {
    req.session.count = (req.session.count || 0) + 1;
    return {
      count: req.session.count
    };
  }


  @Get("/error")
  error() {
    throw new Error("an example error");
  }

  @Get("/peoples")
  peoples(@withODataService(People) peopleService: InjectWrappedInstance<TypedService<People>>) {
    return peopleService.find();
  }


}
