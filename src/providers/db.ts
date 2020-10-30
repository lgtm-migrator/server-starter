import { inject, noWrap, withType } from "@newdash/inject";
import { Connection, createDBConnection } from "@odata/server";
import { register } from "../.internal";
import { InjectType } from "../constants";
import { People } from "../models/People";

@register
export class ConnectionProvider {

  @noWrap
  private conns: Map<string, Connection>;

  @withType(Connection)
  @noWrap
  async provide(@inject(InjectType.TenantId) tenantId: string) {
    if (this.conns === undefined) {
      this.conns = new Map();
    }

    if (!this.conns.has(tenantId)) {
      // read connection info from config
      this.conns.set(
        tenantId,
        await createDBConnection({
          name: tenantId,
          synchronize: true,
          type: "sqljs",
          entities: [People]
        })
      );

    }

    return this.conns.get(tenantId);

  }

}