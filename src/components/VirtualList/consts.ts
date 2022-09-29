import { createContext } from 'react';
import Cache from './utils/cache';

type keyList = { id: string | number }[];
export interface DataType extends keyList {}

export const createCache = (knownSizes = {}) => new Cache(knownSizes);

export const VirtualTableContext = createContext<{
  // 缓存对象
  cache: Cache;
}>({
  cache: createCache(),
});
