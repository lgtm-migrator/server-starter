export interface AccessToken {
  jti?: string;
  ext_attr?: EXTAttr;
  "xs.system.attributes"?: XsSystemAttributes;
  given_name?: string;
  "xs.user.attributes"?: XsUserAttributes;
  family_name?: string;
  sub?: string;
  scope?: string[];
  client_id?: string;
  cid?: string;
  azp?: string;
  grant_type?: string;
  user_id?: string;
  origin?: string;
  user_name?: string;
  email?: string;
  auth_time?: number;
  rev_sig?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  zid?: string;
  aud?: string[];
}

export interface EXTAttr {
  enhancer?: string;
  subaccountid?: string;
  zdn?: string;
}

export interface XsSystemAttributes {
  "xs.rolecollections"?: string[];
}

export interface XsUserAttributes {
}
