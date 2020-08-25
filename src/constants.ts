
export enum InjectType {

  Server = 'express:server',
  Request = 'express:request',
  Response = 'express:response',
  NextFunction = 'express:next_function',

  Controllers = 'application:controllers',
  Services = 'application:services',


}