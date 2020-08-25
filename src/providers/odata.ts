import { inject, noWrap, provider } from "@newdash/inject";
import { Connection, createTypedODataServer, TypedODataServer } from "@odata/server";
import { register } from "../.internal";
import { People } from "../models/People";

@register
export class ODataProvider {

  @inject(Connection)
  conn: any

  @provider(TypedODataServer)
  @noWrap
  async provide() {
    return createTypedODataServer(this.conn, People);
  }

}