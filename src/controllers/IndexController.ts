import { InjectWrappedInstance } from "@newdash/inject";
import { TypedService } from "@odata/server";
import { Request } from "client-oauth2";
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
    // @ts-ignore
    req.session.count = (req.session.count || 0) + 1;
    return {
      // @ts-ignore
      count: req.session.count
    };
  }

  @Get("/user")
  user(@InjectRequest req: Request) {
    return {
      // @ts-ignore
      user: req.session.user
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
