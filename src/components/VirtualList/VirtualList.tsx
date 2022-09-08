import {
  FixedSizeList,
  type ListChildComponentProps,
  type ListOnItemsRenderedProps,
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { type FC, type ReactNode } from 'react';
import { VirtualTableContext } from './consts';
import cx from 'classnames';
import ListWrapper from './ListWrapper';

export interface VirtualListProps<T> {
  // 展示的数据
  list: T[];
  // 行渲染方法
  lineRender: (row: T, index: number) => ReactNode;
  // 渲染滚动行
  scrollingRender?: (index: number) => ReactNode;
  // 请求下页数据
  nextPage: () => void;
  // 触发下页请求的滚动百分比, 取值范围 0.1 - 0.95 即 10% - 95%
  nextTrigger?: number;
  // 每行的高度
  rowHeight?: number;
  // 顶部固定行数量
  fixedTopCount?: number;
  // 空态图
  emptyNode?: ReactNode;
}

const VirtualList: FC<VirtualListProps<any>> = <T,>({
  list,
  lineRender,
  scrollingRender,
  nextPage,
  nextTrigger = 0.55, // 默认值 55%
  rowHeight = 45,
  fixedTopCount = 0, // 默认不锁定行
  emptyNode,
}: VirtualListProps<T>) => {
  // 监听渲染的行索引
  const onItemsRendered = (info: ListOnItemsRenderedProps) => {
    // 触发比例范围检查: 10% - 95%
    const nt = nextTrigger > 0.95 ? 0.95 : nextTrigger < 0.1 ? 0.1 : nextTrigger;

    // 渲染超过55%，请求后面的数据
    if (info.overscanStopIndex / list.length >= nt) {
      // 更新下页数据
      nextPage();
    }
  };

  return (
    <AutoSizer>
      {({ width, height }: { width: number; height: number }) => {
        return (
          <VirtualTableContext.Provider
            value={{
              fixedTopCount,
              list,
              rowHeight,
              lineRender,
              width,
            }}
          >
            <FixedSizeList
              innerElementType={ListWrapper}
              itemData={{
                list: list.length > fixedTopCount ? list.slice(fixedTopCount, list.length) : [],
              }}
              itemCount={list.length > fixedTopCount ? list.length - fixedTopCount : 1}
              height={height}
              width={width}
              itemSize={rowHeight}
              overscanCount={3}
              onItemsRendered={onItemsRendered}
              useIsScrolling={!!scrollingRender}
            >
              {(props: ListChildComponentProps<{ list: T[] }>) => {
                const { data, index, style, isScrolling } = props;
                const row = data.list[index];
                const idx = index + fixedTopCount;
                return (
                  <div
                    className={cx(
                      'flex flex-col items-center border-b border-b-[#eee] bg-white hover:bg-[#f6f6f6]'
                    )}
                    style={{
                      ...style,
                      top: idx * rowHeight,
                    }}
                  >
                    {isScrolling ? scrollingRender?.(index + 1) : row && lineRender(row, idx)}
                  </div>
                );
              }}
            </FixedSizeList>
            {list.length === 0 && (
              <div className="absolute bottom-0 left-0 z-50 bg-white" style={{ width, height }}>
                {emptyNode}
              </div>
            )}
          </VirtualTableContext.Provider>
        );
      }}
    </AutoSizer>
  );
};

VirtualList.displayName = 'VirtualList';

export default VirtualList;
