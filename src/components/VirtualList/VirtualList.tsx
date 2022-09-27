import {
  type ListChildComponentProps,
  type ListOnItemsRenderedProps,
  type VariableSizeListProps,
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { type FC, type ReactNode, type CSSProperties, useRef } from 'react';
import { type DataType, VirtualTableContext, createCache } from './consts';
import DynamicList from './DynamicList';
import cx from 'classnames';

export interface VirtualListProps<T extends DataType>
  extends Omit<
    VariableSizeListProps,
    | 'children'
    | 'width'
    | 'height'
    | 'itemCount'
    | 'itemSize'
    | 'itemData'
    | 'overscanCount'
    | 'onItemsRendered'
    | 'useIsScrolling'
  > {
  // 展示的数据
  list: T;
  // 行渲染方法
  lineRender: (row: any, index: number) => ReactNode;
  // 渲染滚动行
  scrollingRender?: (index: number) => ReactNode;
  // 请求下页数据
  nextPage: () => void;
  // 触发下页请求的滚动百分比, 取值范围 0.1 - 0.95 即 10% - 95%
  nextTrigger?: number;
  // 空态图
  emptyNode?: ReactNode;

  // 列表外部类名
  wrapperClass?: string;
  // 行类名
  lineClass?: (index: number) => string;
  // 行内联样式
  lineStyle?: (index: number) => Partial<CSSProperties>;
}

const VirtualList: FC<VirtualListProps<DataType>> = ({
  list,
  lineRender,
  nextPage,
  nextTrigger = 0.55, // 默认值 55%
  emptyNode,
  scrollingRender,
  wrapperClass,
  lineClass,
  lineStyle,
  ...rest
}) => {
  const dynamicListRef = useRef<any>();

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
      {({ width, height }) => {
        return (
          <VirtualTableContext.Provider value={{ cache: createCache() }}>
            <DynamicList
              {...rest}
              ref={dynamicListRef}
              itemData={list}
              height={height}
              width={width}
              className={wrapperClass}
              overscanCount={3}
              onItemsRendered={onItemsRendered}
              useIsScrolling={!!scrollingRender}
            >
              {({ data, index, style, isScrolling }: ListChildComponentProps<DataType>) => {
                const row = data[index];
                return (
                  <div
                    className={cx(
                      'border-b border-b-[#eee] bg-white hover:bg-[#f6f6f6]',
                      lineClass?.(index)
                    )}
                    style={{ ...style, ...lineStyle?.(index) }}
                  >
                    {isScrolling ? scrollingRender?.(index) : lineRender(row, index)}
                  </div>
                );
              }}
            </DynamicList>
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
