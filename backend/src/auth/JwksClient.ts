import axios from 'axios';

import { certToPEM } from './utils';
import { CertSigningKey } from './CertSigningKey';
import { Jwk } from './Jwk';

let jwksCache: Jwk[] = [];

export class JwksClient {
    public constructor(private readonly jwksUrl: string) { }

    async getJwks(): Promise<Jwk[]> {
        if (jwksCache.length > 0) return jwksCache;

        const res = await axios.get(this.jwksUrl);
        const jwks = res.data.keys;

        jwksCache = jwks;

        return jwks;
    }

    async getSigningKeys(): Promise<CertSigningKey[]> {
        const jwks = await this.getJwks();

        if (!jwks || jwks.length === 0) {
            throw new Error('The JWKS endpoint did not contain any keys');
        }

        const signingKeys = jwks
            .filter(
                (key): boolean =>
                    key.use === 'sig' && // JWK property `use` determines the JWK is for signing
                    key.kty === 'RSA' && // We are only supporting RSA
                    key.kid && // The `kid` must be present to be useful for later
                    key.x5c &&
                    key.x5c.length > 0 // Has useful public keys (we aren't using n or e)
            )
            .map(
                (key): CertSigningKey => ({
                    kid: key.kid,
                    nbf: key.nbf,
                    publicKey: certToPEM(key.x5c[0]),
                }),
            );

        // If at least a single signing key doesn't exist we have a problem... Kaboom.
        if (!signingKeys.length) {
            throw new Error(
                'The JWKS endpoint did not contain any signing keys',
            );
        }

        // Returns all of the available signing keys.
        return signingKeys;
    }

    async getSigningKey(kid: string): Promise<CertSigningKey> {
        const keys = await this.getSigningKeys();

        const signingKey = keys.find((key): boolean => key.kid === kid);

        if (!signingKey) {
            throw new Error(
                `Unable to find a signing key that matches '${kid}'`,
            );
        }

        return signingKey;
    }
}
