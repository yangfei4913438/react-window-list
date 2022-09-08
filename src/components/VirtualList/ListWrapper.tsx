import { useContext, forwardRef, type HTMLProps } from 'react';
import cx from 'classnames';
import { VirtualTableContext } from './consts';

const ListWrapper = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ children, ...rest }, ref) => {
    const { list, fixedTopCount, rowHeight, lineRender } = useContext(VirtualTableContext);

    return (
      <div ref={ref} {...rest}>
        <div
          className="sticky top-0"
          style={{
            zIndex: 51,
            boxShadow: '0 2px 4px 0 #eee',
          }}
        >
          {list.slice(0, fixedTopCount).map((row, index) => {
            return (
              <div
                className={cx(
                  'flex flex-col items-center border-b border-b-[#eee] bg-white hover:bg-[#f6f6f6]'
                )}
                style={{
                  top: index * rowHeight,
                  height: rowHeight,
                }}
                key={index}
              >
                {lineRender(row, index)}
              </div>
            );
          })}
        </div>
        {children}
      </div>
    );
  }
);

export default ListWrapper;
