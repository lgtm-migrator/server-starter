export interface FeatureFlagEnv {
  label: string;
  provider: null;
  plan: string;
  name: string;
  tags: string[];
  instance_name: string;
  binding_name: null;
  credentials: Credentials;
  syslog_drain_url: null;
  volume_mounts: any[];
}

export interface Credentials {
  password: string;
  uri: string;
  username: string;
}
