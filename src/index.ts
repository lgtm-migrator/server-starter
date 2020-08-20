import { InjectContainer } from "@newdash/inject";
import { TypedODataServer } from "@odata/server";
import "reflect-metadata";
import { InjectKey } from "./.internal";
import { Configuration } from "./config";
import { ConfigurationProvider, ConnectionProvider, ODataProvider } from "./providers";
import { ApplicationServer } from "./server";

if (require.main == module) {

  (async () => {

    const ic = InjectContainer.New();
    ic.registerProvider(ConfigurationProvider, ODataProvider, ConnectionProvider);
    ic.doNotWrap(Configuration, TypedODataServer, InjectKey.DBConnection);

    const config = await ic.getInstance(Configuration);
    const appServer = await ic.getInstance(ApplicationServer);
    const app = await appServer.createServer();

    app.listen(parseInt(config.get("PORT"), 10));

  })().catch(console.error);

}


