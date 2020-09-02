import { InjectWrappedInstance } from "@newdash/inject";
import { TypedService } from "@odata/server";
import { Request } from "express";
import { Get, InjectRequest, withConfigValue, withODataService } from "../.internal";
import { People } from "../models/People";

export class IndexController {

  @withConfigValue("SERVER_NAME")
  private serverName: string;

  @Get()
  index() {
    return {
      service: this.serverName,
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
