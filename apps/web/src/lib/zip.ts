const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let current = index;

    for (let bit = 0; bit < 8; bit += 1) {
      current =
        (current & 1) === 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
    }

    table[index] = current >>> 0;
  }

  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  return {
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
    dosTime: (hours << 11) | (minutes << 5) | seconds
  };
}

function createLocalFileHeader(
  fileNameBytes: Uint8Array,
  uncompressedSize: number,
  crc: number,
  dosTime: number,
  dosDate: number
) {
  const header = new Uint8Array(30 + fileNameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, dosTime, true);
  view.setUint16(12, dosDate, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, uncompressedSize, true);
  view.setUint32(22, uncompressedSize, true);
  view.setUint16(26, fileNameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(fileNameBytes, 30);

  return header;
}

function createCentralDirectoryHeader(
  fileNameBytes: Uint8Array,
  uncompressedSize: number,
  crc: number,
  dosTime: number,
  dosDate: number,
  localHeaderOffset: number
) {
  const header = new Uint8Array(46 + fileNameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, dosTime, true);
  view.setUint16(14, dosDate, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, uncompressedSize, true);
  view.setUint32(24, uncompressedSize, true);
  view.setUint16(28, fileNameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  header.set(fileNameBytes, 46);

  return header;
}

function createEndOfCentralDirectoryRecord(
  fileCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number
) {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return record;
}

export interface ZipFileEntry {
  fileName: string;
  blob: Blob;
}

function toBlobPart(bytes: Uint8Array) {
  return Uint8Array.from(bytes).buffer;
}

export async function buildZipBlob(entries: ZipFileEntry[]) {
  const encoder = new TextEncoder();
  const archiveParts: BlobPart[] = [];
  const centralDirectoryParts: ArrayBuffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const safeFileName = entry.fileName.replace(/^\/+/, "").replace(/\\/g, "/");
    const fileNameBytes = encoder.encode(safeFileName);
    const fileBytes = new Uint8Array(await entry.blob.arrayBuffer());
    const checksum = crc32(fileBytes);
    const { dosDate, dosTime } = getDosDateTime(new Date());
    const localHeader = createLocalFileHeader(
      fileNameBytes,
      fileBytes.length,
      checksum,
      dosTime,
      dosDate
    );

    archiveParts.push(toBlobPart(localHeader), toBlobPart(fileBytes));
    centralDirectoryParts.push(
      toBlobPart(
        createCentralDirectoryHeader(
          fileNameBytes,
          fileBytes.length,
          checksum,
          dosTime,
          dosDate,
          offset
        )
      )
    );
    offset += localHeader.length + fileBytes.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralDirectoryParts.reduce(
    (total, part) => total + part.byteLength,
    0
  );
  const endRecord = createEndOfCentralDirectoryRecord(
    entries.length,
    centralDirectorySize,
    centralDirectoryOffset
  );

  return new Blob(
    [...archiveParts, ...centralDirectoryParts, toBlobPart(endRecord)],
    {
      type: "application/zip"
    }
  );
}
