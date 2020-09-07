import { isArray } from "@newdash/newdash/isArray";
import { setupClient } from "./utils";

describe('Index Controller Test Suite', () => {

  it('should impl index page', async () => {
    const client = await setupClient();
    const res = await client.get("").json<any>();
    expect(res['service']).not.toBeUndefined();
    await client.shutdown();
  });

  it('should support query odata collection', async () => {
    const client = await setupClient();
    const res = await client.get("peoples").json<any>();
    expect(isArray(res)).toBeTruthy();
    // call twice to verify db transaction works
    const res2 = await client.get("peoples").json<any>();
    expect(isArray(res2)).toBeTruthy();
  });

});

