import CryptoJS from 'crypto-js';

export const hashSha256 = (data: string) => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

export const hashSha1 = (data: string) => {
    return CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
};
  
export const encryptAES = (data: string, secretKey: string) => {
    const encrypted = CryptoJS.AES.encrypt(data, secretKey);
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

export const decryptAES = (encryptedHex: string, secretKey: string) => {
    const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedHex);
    const encryptedCipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encryptedWordArray });

    const decryptedBytes = CryptoJS.AES.decrypt(encryptedCipherParams, secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
};
  
