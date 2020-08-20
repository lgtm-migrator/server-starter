import { BaseODataModel, IncKeyProperty, ODataEntityType, Property } from "@odata/server";
import "reflect-metadata";

@ODataEntityType()
export class People extends BaseODataModel {

  @IncKeyProperty()
  pid: number;

  @Property()
  name: string;

}