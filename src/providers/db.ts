import { inject, provider } from "@newdash/inject";
import { Connection, createDBConnection } from "@odata/server";
import { Configuration } from "../config";
import { People } from "../models/People";

export class ConnectionProvider {

  @inject()
  private config: Configuration

  @provider(Connection)
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