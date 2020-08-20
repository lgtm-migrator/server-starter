import { inject, provider } from "@newdash/inject";
import { Connection, createTypedODataServer, TypedODataServer } from "@odata/server";
import { People } from "../models/People";

export class ODataProvider {

  @inject(Connection)
  conn: any

  @provider(TypedODataServer)
  async provide() {
    return createTypedODataServer(this.conn, People);
  }

}