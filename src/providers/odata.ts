import { getUnProxyTarget, inject, noWrap, provider, required, transient, withType } from "@newdash/inject";
import { Connection, createTypedODataServer, TransactionContext, TypedODataServer } from "@odata/server";
import { register } from "../.internal";
import { InjectType } from "../constants";
import { entities } from "../models";

@register
export class ODataProvider {

  @inject(Connection)
  conn: any

  @provider(TypedODataServer)
  @noWrap
  async provide() {
    return createTypedODataServer(this.conn, ...entities);
  }

}

@register
export class ODataServiceProvider {

  @transient
  @withType(InjectType.ODataService)
  async provide(
    @required @inject(InjectType.ODataServiceType) entityType,
    @required @inject(TypedODataServer) server: typeof TypedODataServer,
    @required @inject(InjectType.ODataTransaction) tx: TransactionContext
  ) {
    const [service] = await server.getServicesWithContext(tx, getUnProxyTarget(entityType));
    return service;
  }

}
