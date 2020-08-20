import { inject, provider } from "@newdash/inject";
import { createTypedODataServer, TypedODataServer } from "@odata/server";
import { InjectKey } from "../.internal";
import { People } from "../models/People";

export class ODataProvider {

  @inject(InjectKey.DBConnection)
  conn: any

  @provider(TypedODataServer)
  async provide() {
    return createTypedODataServer(this.conn, People);
  }

}