import { type ReactNode, createContext } from 'react';

export const VirtualTableContext = createContext<{
  // 展示的数据
  list: any[];
  // 顶部固定行数量
  fixedTopCount: number;
  // 每行的高度
  rowHeight: number;
  // 宽度
  width: number;
  // 行渲染方法
  lineRender: (row: any, index: number) => ReactNode;
}>({
  list: [],
  fixedTopCount: 0,
  rowHeight: 45,
  width: 0,
  lineRender: () => undefined,
});
