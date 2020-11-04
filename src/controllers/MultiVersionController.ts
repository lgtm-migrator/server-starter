import { feature, Get } from "../.internal";


export class MultiVersionController {


  @Get("/cat")
  @feature("cat-feature-v2-enable", "true")
  catV2() {
    return { sound: "meow !!!" };
  }

  @Get("/cat")
  cat() {
    return { sound: "meow" };
  }


}