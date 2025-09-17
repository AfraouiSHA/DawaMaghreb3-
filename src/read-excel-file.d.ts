// src/typings.d.ts (ou src/read-excel-file.d.ts)

declare module 'read-excel-file' {
  function readXlsxFile(file: File | Blob, options?: any): Promise<any[][]>;
  export default readXlsxFile;
}