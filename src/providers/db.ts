import { inject, noWrap, provider } from "@newdash/inject";
import { Connection, createDBConnection } from "@odata/server";
import { register } from "../.internal";
import { Configuration } from "../config";
import { People } from "../models/People";

@register
export class ConnectionProvider {

  @inject()
  private config: Configuration

  @provider(Connection)
  @noWrap
  async provide() {
    // read connection info from config
    return createDBConnection({
      name: "dev_conn",
      synchronize: true,
      type: "sqljs",
      entities: [People]
    });

  }

}