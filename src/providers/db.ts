import { inject, provider } from "@newdash/inject";
import { createDBConnection } from "@odata/server";
import { InjectKey } from "../.internal";
import { Configuration } from "../config";
import { People } from "../models/People";

export class ConnectionProvider {

  @inject()
  private config: Configuration

  @provider(InjectKey.DBConnection)
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