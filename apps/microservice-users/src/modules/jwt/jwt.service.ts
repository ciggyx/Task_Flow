import * as fs from 'fs';
import * as path from 'path';
import { importSPKI, exportJWK } from 'jose';
import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private privateKey: Buffer;
  private publicKey: Buffer;
  private kid: string; // key id usado en el token + jwks

  constructor() {
    const basePath = path.resolve(__dirname, 'keys');
    this.privateKey = fs.readFileSync(path.join(basePath, 'private.dev.pem'));
    this.publicKey = fs.readFileSync(path.join(basePath, 'public.dev.pem'));

    this.kid = process.env.JWT_KID || 'main-key';
  }

  sign(payload: object, options?: { expiresIn?: string }) {
    return sign(payload, this.privateKey, {
      algorithm: 'RS256',
      // Refactorizar esto que no quede acá si no que lo tome de las config
      expiresIn: '1h',
      keyid: this.kid,
    });
  }

  // Devuelve la public key PEM
  getPublicPem(): Buffer {
    return this.publicKey;
  }

  // Devuelve la JWK (key set con una sola key)
  async getJwks() {
    const publicPem = this.publicKey.toString('utf8');

    // Importa PEM → CryptoKey
    const cryptoKey = await importSPKI(publicPem, 'RS256');

    // Exporta CryptoKey → JWK
    const jwk = await exportJWK(cryptoKey);

    jwk.use = 'sig';
    jwk.alg = 'RS256';
    jwk.kid = this.kid;

    console.log('JWKS SERVED');
    return { keys: [jwk] };
  }
}
