import { Get, Post } from "../.internal";
import { hasAttribute, hasScope } from "../.internal/decorators/permission";


export class OrgController {

  @Get("/org")
  @hasScope("Org.Display")
  readOrg() { return { success: true }; }

  @Post("/org")
  @hasScope("Org.Write")
  writeOrg() { return { success: true }; }

  @Get("/org-for-male")
  @hasScope("Org.Display")
  @hasAttribute("Gender", "male")
  readOrgMale() {
    return { success: true, data: [] };
  }

}