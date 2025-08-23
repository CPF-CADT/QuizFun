declare module "fuzzysort" {
  export interface FuzzysortOptions<T> {
    keys?: (keyof T)[];
    threshold?: number;
    limit?: number;
  }

  export interface FuzzysortResult<T> {
    obj: T;
    score: number;
  }

  export function go<T>(
    query: string,
    list: T[],
    options?: FuzzysortOptions<T>
  ): FuzzysortResult<T>[];

  const _default: { go: typeof go };
  export default _default;
}
