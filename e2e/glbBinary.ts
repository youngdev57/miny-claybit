/** GLB 컨테이너 포맷(header 12B + JSON/BIN 청크)을 외부 라이브러리 없이 직접 파싱한다.
 * three.js GLTFLoader는 로드 시 노드 이름을 sanitize(공백 → '_')하므로, 내보낸 파일에
 * 한글 이름이 "가공 없이" 그대로 보존됐는지는 이 원시 파서로만 정확히 확인할 수 있다. */

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_TYPE_JSON = 0x4e4f534a; // "JSON"
const CHUNK_TYPE_BIN = 0x004e4942; // "BIN\0"

export interface ParsedGlb {
  version: number;
  json: {
    scenes?: unknown[];
    nodes?: Array<{ name?: string; children?: number[]; mesh?: number }>;
    meshes?: unknown[];
    materials?: unknown[];
    [key: string]: unknown;
  };
  hasBinChunk: boolean;
}

export function parseGlbBinary(buffer: Buffer): ParsedGlb {
  if (buffer.length < 12) throw new Error('GLB 파일이 12바이트 헤더보다 짧습니다.');

  const magic = buffer.readUInt32LE(0);
  if (magic !== GLB_MAGIC) throw new Error(`GLB magic 값이 올바르지 않습니다: 0x${magic.toString(16)}`);

  const version = buffer.readUInt32LE(4);
  const totalLength = buffer.readUInt32LE(8);
  if (totalLength !== buffer.length) {
    throw new Error(`GLB length 필드(${totalLength})가 실제 파일 크기(${buffer.length})와 일치하지 않습니다.`);
  }

  let offset = 12;
  let json: ParsedGlb['json'] | null = null;
  let hasBinChunk = false;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;
    if (chunkEnd > buffer.length) throw new Error('GLB 청크 길이가 파일 범위를 벗어납니다.');

    if (chunkType === CHUNK_TYPE_JSON) {
      json = JSON.parse(buffer.subarray(chunkStart, chunkEnd).toString('utf-8'));
    } else if (chunkType === CHUNK_TYPE_BIN) {
      hasBinChunk = true;
    }

    offset = chunkEnd;
  }

  if (!json) throw new Error('GLB 파일에서 JSON 청크를 찾지 못했습니다.');

  return { version, json, hasBinChunk };
}

/** 한글(가-힣) 포함 여부. */
export function containsHangul(text: string): boolean {
  return /[가-힣]/.test(text);
}
