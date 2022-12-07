import CryptoJS from "crypto-js";

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return CryptoJS.createHash('sha256').update(buffer).digest();
}


export function getCodeVerifierAndChallenge() {
    var verifier = base64URLEncode(CryptoJS.randomBytes(32));
    var challenge = base64URLEncode(sha256(verifier));
    return { verifier, challenge };
}