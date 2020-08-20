import { BaseODataModel, KeyProperty, ODataEntityType, Property } from "@odata/server";
import "reflect-metadata";

@ODataEntityType()
export class People extends BaseODataModel {

  @KeyProperty()
  pid: number;

  @Property()
  name: string;

}