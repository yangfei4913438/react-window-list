export type cacheValuesType = {
  [key: string]: { height: number; width: number };
};

export default class Cache {
  values: cacheValuesType = {};

  constructor(initialValues: cacheValuesType) {
    this.values = { ...initialValues };
  }

  clearCache(): void {
    this.values = {};
  }
}
