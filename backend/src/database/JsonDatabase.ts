import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.resolve(__dirname, '../../src/database/data');

export type Document = Record<string, any> & { id: string; createdAt: string; updatedAt: string };

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: { field: string; order: 'asc' | 'desc' };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class JsonDatabase<T extends Document> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(collection: string) {
    this.filePath = path.join(DATA_DIR, `${collection}.json`);
    this.ensureFile();
  }

  private ensureFile(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8');
    }
  }

  private read(): T[] {
    if (this.cache) return this.cache;
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    try {
      this.cache = JSON.parse(raw);
      return this.cache!;
    } catch {
      this.cache = [];
      return this.cache;
    }
  }

  private write(data: T[]): void {
    this.cache = data;
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private now(): string {
    return new Date().toISOString();
  }

  findAll(): T[] {
    return this.read();
  }

  findById(id: string): T | undefined {
    return this.read().find((doc) => doc.id === id);
  }

  findOne(predicate: (doc: T) => boolean): T | undefined {
    return this.read().find(predicate);
  }

  findMany(predicate: (doc: T) => boolean): T[] {
    return this.read().filter(predicate);
  }

  create(data: Partial<T>): T {
    const docs = this.read();
    const doc = {
      ...data,
      id: data.id || uuidv4(),
      createdAt: this.now(),
      updatedAt: this.now(),
    } as unknown as T;
    docs.push(doc);
    this.write(docs);
    return doc;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const docs = this.read();
    const index = docs.findIndex((doc) => doc.id === id);
    if (index === -1) return undefined;
    docs[index] = { ...docs[index], ...data, id, updatedAt: this.now() };
    this.write(docs);
    return docs[index];
  }

  delete(id: string): boolean {
    const docs = this.read();
    const index = docs.findIndex((doc) => doc.id === id);
    if (index === -1) return false;
    docs.splice(index, 1);
    this.write(docs);
    return true;
  }

  count(predicate?: (doc: T) => boolean): number {
    if (predicate) return this.read().filter(predicate).length;
    return this.read().length;
  }

  paginate(options: PaginationOptions = {}): PaginatedResult<T> {
    const { page = 1, limit = 10, sort } = options;
    let data = this.read();
    if (sort) {
      data = [...data].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);
    return { data: paged, total, page, limit, totalPages };
  }

  upsert(predicate: (doc: T) => boolean, data: Partial<T>): T {
    const existing = this.findOne(predicate);
    if (existing) {
      return this.update(existing.id, data) as T;
    }
    return this.create(data as Partial<T>);
  }

  clearCache(): void {
    this.cache = null;
  }
}
