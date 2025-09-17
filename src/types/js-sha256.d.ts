// src/types/js-sha256.d.ts
declare module 'js-sha256' {
  interface SHA256 {
    (message: string | Uint8Array | ArrayBuffer): string; // Signature appelable pour sha256()
    hex(message: string | Uint8Array | ArrayBuffer): string;
    array(message: string | Uint8Array | ArrayBuffer): number[];
    arrayBuffer(message: string | Uint8Array | ArrayBuffer): ArrayBuffer;
    digest(message: string | Uint8Array | ArrayBuffer): number[]; // C'est généralement un alias pour array()
    update(message: string | Uint8Array | ArrayBuffer): SHA256; // Retourne l'instance pour le chaînage
    create(): SHA256; // Pour le hachage incrémental
  }

  export const sha256: SHA256;
}