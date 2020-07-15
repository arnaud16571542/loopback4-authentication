import {inject, Provider} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';

import {AuthErrorKeys} from '../../../error-keys';
import {IAuthUser} from '../../../types';
import {Strategies} from '../../keys';
import {KeycloakProfile, VerifyFunction} from '../../types';

export const KeycloakStrategy = require('@exlinc/keycloak-passport');

export interface KeycloakStrategyFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (options: any): typeof KeycloakStrategy;
}

export class KeycloakStrategyFactoryProvider
  implements Provider<KeycloakStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.KEYCLOAK_VERIFIER)
    private readonly verifierKeycloak: VerifyFunction.KeycloakAuthFn,
  ) {}

  value(): KeycloakStrategyFactory {
    return (options) => this.getGoogleAuthStrategyVerifier(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getGoogleAuthStrategyVerifier(options: any): typeof KeycloakStrategy {
    return new KeycloakStrategy(
      options,
      async (
        accessToken: string,
        refreshToken: string,
        profile: KeycloakProfile,
        cb: (err?: string | Error, user?: IAuthUser) => void,
      ) => {
        try {
          const user = await this.verifierKeycloak(
            accessToken,
            refreshToken,
            profile,
            cb,
          );
          if (!user) {
            throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials);
          }
          cb(undefined, user);
        } catch (err) {
          cb(err);
        }
      },
    );
  }
}
