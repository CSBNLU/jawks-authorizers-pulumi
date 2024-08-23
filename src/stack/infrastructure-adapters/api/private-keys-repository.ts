export interface Props {
  secretARN: string;
}

export interface PrivateKeysRepository {
  retrievePrivateKey: (props: Props) => Promise<{ key: string; kid: string }>;
}
