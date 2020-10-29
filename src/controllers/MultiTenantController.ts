import { noWrap } from "@newdash/inject";
import { Request } from "express";
import { Delete, InjectRequest, Put } from "../.internal";


export class MultiTenantController {

  @Put('/callback/v1.0/tenants/*')
  subscribe(@noWrap @InjectRequest req: Request) {
    const { subscribedSubdomain } = req.body;
    const tenantUrl = `https://${subscribedSubdomain}-${req.headers.host}`;
    console.log(`call subscribe with ${tenantUrl}`);
    req.res.end(tenantUrl);
  }

  @Delete('/callback/v1.0/tenants/*')
  unSubscribe(@noWrap @InjectRequest req: Request) {
    const { subscribedSubdomain } = req.body;
    const tenantUrl = `https://${subscribedSubdomain}-${req.headers.host}`;
    console.log(`call un-subscribe with ${tenantUrl}`);
    req.res.status(200).end();
  }

}