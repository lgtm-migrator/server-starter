import { getUnProxyTarget, inject, noWrap, required, transient, withType } from "@newdash/inject";
import { Connection, createTypedODataServer, TransactionContext, TypedODataServer } from "@odata/server";
import { Router } from "express";
import { register } from "../.internal";
import { InjectType } from "../constants";
import { entities } from "../models";

@register
export class ODataProvider {

  @noWrap
  private tenants: Map<string, typeof TypedODataServer>;

  @noWrap
  @transient
  @withType(InjectType.ODataServer)
  async provide(
    @noWrap @inject(InjectType.TenantId) tenantId: string,
    @noWrap @inject(Connection) conn: Connection
  ) {
    if (this.tenants === undefined) {
      this.tenants = new Map();
    }

    if (!this.tenants.has(tenantId)) {
      this.tenants.set(tenantId, await createTypedODataServer(conn, ...entities));
    }

    return this.tenants.get(tenantId);
  }

}


@register
export class ODataRouterProvider {

  @noWrap
  private routers: Map<typeof TypedODataServer, Router>

  @transient
  @withType(InjectType.ODataServerRouter)
  async provide(@required @inject(InjectType.ODataServer) server: typeof TypedODataServer) {
    if (this.routers === undefined) {
      this.routers = new Map();
    }
    if (!this.routers.has(server)) {
      this.routers.set(server, server.create());
    }
    return this.routers.get(server);
  }

}


@register
export class ODataServiceProvider {

  @transient
  @withType(InjectType.ODataService)
  async provide(
    @required @inject(InjectType.ODataServiceType) entityType,
    @required @inject(InjectType.ODataServer) server: typeof TypedODataServer,
    @required @inject(InjectType.ODataTransaction) tx: TransactionContext
  ) {
    const [service] = await server.getServicesWithContext(tx, getUnProxyTarget(entityType));
    return service;
  }

}
