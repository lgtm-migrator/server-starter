import { InjectContainer } from "@newdash/inject";
import { Connection, TypedODataServer } from "@odata/server";
import { Express } from "express";
import "reflect-metadata";
import { Configuration } from "./config";
import { InjectType } from "./constants";
import { ConfigurationProvider, ConnectionProvider, ODataProvider, ServerProvider } from "./providers";
if (require.main == module) {

  (async () => {

    const ic = InjectContainer.New();
    // register providers
    ic.registerProvider(ConfigurationProvider, ODataProvider, ConnectionProvider, ServerProvider);
    // do not wrap this types
    ic.doNotWrap(Configuration, TypedODataServer, Connection);

    const config = await ic.getInstance(Configuration);
    const app = await ic.getInstance(InjectType.Server) as Express;
    const port = parseInt(config.get("PORT"), 10);

    app.listen(port, () => console.log(`app started at port ${port}`));

  })().catch(console.error);

}


