export interface PrivateKeyRepository {
  retrievePrivateKey: () => Promise<{ key: string; kid: string }>;
}
