import { useEffect, useRef, ForwardedRef } from 'react';
import { VariableSizeList } from 'react-window';

const useShareForwardedRef = (forwardedRef: ForwardedRef<VariableSizeList>) => {
  const innerRef = useRef<any>();

  useEffect(() => {
    if (!forwardedRef) {
      return;
    }
    if (typeof forwardedRef === 'function') {
      forwardedRef(innerRef.current);
    } else {
      if (forwardedRef.current) {
        forwardedRef.current = innerRef.current;
      }
    }
  });

  return innerRef;
};

export default useShareForwardedRef;
