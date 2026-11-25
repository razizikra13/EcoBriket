// Penyimpanan berkas JSON sederhana (cukup untuk prototipe / satu server).
// Untuk produksi, ganti dengan PostgreSQL/SQLite — lihat README.
import fs from 'node:fs';
import path from 'node:path';

const EMPTY = () => ({ version: 1, users: [], sessions: [], states: {} });

export class JsonDB {
  constructor(file) {
    this.file = file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try {
      this.data = Object.assign(EMPTY(), JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch (e) {
      if (e.code !== 'ENOENT') console.warn('[db] gagal membaca, mulai kosong:', e.message);
      this.data = EMPTY();
    }
    this.writing = Promise.resolve();
  }

  // Tulis atomik: file sementara lalu rename, berurutan satu per satu.
  save() {
    const snapshot = JSON.stringify(this.data, null, 2);
    this.writing = this.writing.then(async () => {
      const tmp = this.file + '.tmp';
      await fs.promises.writeFile(tmp, snapshot, { mode: 0o600 });
      await fs.promises.rename(tmp, this.file);
    }).catch(e => console.error('[db] gagal menyimpan:', e));
    return this.writing;
  }

  get users() { return this.data.users; }
  get sessions() { return this.data.sessions; }
  get states() { return this.data.states; }
}
