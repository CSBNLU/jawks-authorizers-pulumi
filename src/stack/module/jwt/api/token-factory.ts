export interface TokenFactory<TokenPayload> {
  /*
   * @param props
   * @param props.expiresIn: expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
   * @param props.payload
   * @param props.privateKey
   * @param props.sub
   */
  generateToken: (props: {
    payload: TokenPayload;
    sub: string;
  }) => Promise<{ exp: Date; token: string }>;
}
