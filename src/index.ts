import { InjectContainer } from "@newdash/inject";
import "reflect-metadata";
import { Configuration, ConfigurationProvider } from "./config";
import { ApplicationServer } from "./server";


if (require.main == module) {

  (async () => {

    const ic = InjectContainer.New();
    ic.registerProvider(ConfigurationProvider);
    ic.doNotWrap(Configuration);

    const config = await ic.getInstance(Configuration);
    const appServer = await ic.getInstance(ApplicationServer);
    const app = await appServer.createServer();

    app.listen(parseInt(config.get("PORT"), 10));

  })().catch(console.error);

}


