import { JWT } from "../../module";

export interface PrivateKeysRepositoriesModule {
  accessTokenPrivateKeyRepository: JWT.API.PrivateKeyRepository;
  refreshTokenPrivateKeyRepository: JWT.API.PrivateKeyRepository;
}
