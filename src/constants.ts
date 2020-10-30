
export enum InjectType {

  Server = 'express:server',
  Request = 'express:request',
  Response = 'express:response',
  NextFunction = 'express:next_function',

  Controllers = 'application:controllers',
  Services = 'application:services',

  ODataServer = 'odata:server',
  ODataServerRouter = 'odata:server-express-router',
  ODataService = 'odata:service',
  ODataTransaction = 'odata:transaction',
  ODataServiceType = 'odata:service_type',

  TenantId = 'application:tenant-id',
  UaaCredential = 'application:uaa-credential'

}