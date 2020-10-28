import { Express } from "express";
import "reflect-metadata";
import { container } from "./.internal";
import { Configuration } from "./config";
import { InjectType } from "./constants";
import "./providers";

if (require.main == module) {

  (async () => {

    const config = await container.getInstance(Configuration);
    const app = await container.getInstance(InjectType.Server) as Express;
    const port = parseInt(config.get("PORT"), 10);

    app.listen(port, () => console.log(`app started at port ${port}`));

  })().catch(console.error);

}
