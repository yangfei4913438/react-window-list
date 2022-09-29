import { useEffect, useLayoutEffect, forwardRef, useCallback } from 'react';
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

  const lazyCacheFill = useCallback(() => {
    if (!lazyMeasurement) {
      return;
    }
    itemData.forEach(({ id }, index) => {
      setTimeout(() => {
        if (!cache.values[String(id)]) {
          cache.values[String(id)] = getMeasure(index);
        }
      }, 0);
    });
  }, [lazyMeasurement, itemData, cache]);

  useEffect(() => {
    lazyCacheFill();
    return destroyMeasureLayer;
  }, [lazyCacheFill, destroyMeasureLayer]);

  const handleListResize = useCallback(
    debounce((shouldForceUpdate: boolean = false) => {
      if (listRef.current) {
        cache.clearCache();
        listRef.current.resetAfterIndex(0, shouldForceUpdate);
        lazyCacheFill();
      }
    }, 50),
    [listRef.current, cache, lazyCacheFill]
  );

  // 数据和宽高改变的时候，重新计算dom
  useLayoutEffect(() => {
    handleListResize(true);
  }, [itemData, width, height, rest.useIsScrolling, handleListResize]);

  const itemSize = (index: number) => {
    const { id } = itemData[index];
    if (cache.values[String(id)]) {
      return cache.values[String(id)];
    } else {
      cache.values[String(id)] = getMeasure(index);
      return cache.values[String(id)];
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
