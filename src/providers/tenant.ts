import { noWrap, transient, withType } from "@newdash/inject";
import { Request } from "express";
import { InjectRequest, register } from "../.internal";
import { InjectType } from "../constants";



@register
export class TenantIdProvider {

  @withType(InjectType.TenantId)
  @transient
  async provide(@noWrap @InjectRequest req: Request) {
    return req.session?.user?.ext_attr?.subaccountid || 'default';
  }

}

@register
export class UserIdProvider {

  @withType(InjectType.UserId)
  @transient
  async provide(@noWrap @InjectRequest req: Request) {
    return req.session?.user?.user_id || 'unknown';
  }

}