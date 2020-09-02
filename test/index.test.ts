import { setupClient } from "./utils";


describe('Index Controller Test Suite', () => {

  it('should impl index page', async () => {
    const client = await setupClient();
    const res = await client.get("").json<any>();
    expect(res['service']).not.toBeUndefined();
    await client.shutdown();
  });

});

