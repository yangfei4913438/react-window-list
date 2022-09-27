import { useEffect, useLayoutEffect, forwardRef } from 'react';
import { VariableSizeListProps, VariableSizeList } from 'react-window';
import debounce from 'lodash/debounce';

import useShareForwardedRef from './hooks/useShareForwardedRef';
import measureElement, { destroyMeasureLayer } from './utils/asyncMeasurer';
import { type DataType, VirtualTableContext } from './consts';
import { useContext } from 'react';

interface DynamicListProps
  extends Omit<
    VariableSizeListProps,
    'children' | 'itemSize' | 'itemCount' | 'estimatedItemSize' | 'itemData' | 'data' | 'layout'
  > {
  // 完整数据
  itemData: DataType;
  // 是否异步计算高度
  lazyMeasurement?: boolean;
  children: any;
  debug?: boolean;
}

const DynamicList = forwardRef<VariableSizeList, DynamicListProps>((props, ref) => {
  // 取出参数
  const {
    children,
    itemData,
    height,
    width,
    style,
    lazyMeasurement = true,
    debug = false,
    ...rest
  } = props;

  const { cache } = useContext(VirtualTableContext);
  const listRef = useShareForwardedRef(ref);

  const getMeasure = (index: number) => {
    const MeasurementContainer = (
      <div style={{ width, height, overflowY: 'scroll' }}>
        <div id="item-container" style={{ overflow: 'auto' }}>
          {children({ index, data: itemData, style })}
        </div>
      </div>
    );
    return measureElement(MeasurementContainer, debug);
  };

  const lazyCacheFill = () => {
    if (!lazyMeasurement) {
      return;
    }
    itemData.forEach(({ id }, index) => {
      setTimeout(() => {
        if (!cache.values[id]) {
          cache.values[id] = getMeasure(index);
        }
      }, 0);
    });
  };

  const handleListResize = debounce(() => {
    if (listRef.current) {
      cache.clearCache();
      listRef.current.resetAfterIndex(0);
      lazyCacheFill();
    }
  }, 50);

  useEffect(() => {
    lazyCacheFill();
    if (listRef.current) {
      listRef.current._resetAfterIndex = listRef.current.resetAfterIndex;
    }
    return destroyMeasureLayer;
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex = (index: number, shouldForceUpdate = true) => {
        cache.clearCache();
        lazyCacheFill();
        listRef.current._resetAfterIndex(index, shouldForceUpdate);
      };
    }
  }, [lazyCacheFill]);

  // 数据和宽高改变的时候，重新计算dom
  useLayoutEffect(() => {
    handleListResize();
  }, [itemData, width, height, rest.useIsScrolling]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [itemData.length]);

  const itemSize = (index: number) => {
    const { id } = itemData[index];
    if (cache.values[id]) {
      return cache.values[id];
    } else {
      cache.values[id] = getMeasure(index);
      return cache.values[id];
    }
  };

  return (
    <VariableSizeList
      {...rest}
      layout="vertical"
      ref={listRef}
      itemSize={(idx) => itemSize(idx).height}
      height={height}
      width={width}
      itemCount={itemData.length}
      itemData={itemData}
      children={children}
    />
  );
});

export default DynamicList;
