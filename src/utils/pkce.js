import crypto from 'crypto';

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}


export function getCodeVerifierAndChallenge() {
    var pkce_verifier = base64URLEncode(crypto.randomBytes(32));
    var pkce_challenge = base64URLEncode(sha256(pkce_verifier));
    return { pkce_verifier, pkce_challenge };
}