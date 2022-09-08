import { type FC, useState, useLayoutEffect, useMemo } from 'react';
import { type IPerson, makeData } from './makeData';
import { VirtualList } from '../VirtualList';
import cx from 'classnames';

interface IProps {}

const List: FC<IProps> = () => {
  // 表单数据相关
  // 第几页
  const [pageOffset, setPageOffset] = useState(0);
  // 每页多少条记录
  const [pageSize] = useState(100);
  // 表格数据
  const [list, setList] = useState<IPerson[]>([]);
  // 分组信息
  const [groups, setGroups] = useState<{ [key: string]: IPerson[] }>({});

  // 获取数据的方式
  const getData = (page_offset: number, page_size: number) => {
    // 后台需要的请求参数
    const send: { [key: string]: any } = {
      project_id: 'mock',
      page_offset: page_offset, // 第几页
      page_size: page_size, // 每页几条记录
    };

    console.log('请求数据:', send);

    // 返回mock数据
    return makeData(page_size);
  };

  // 下一页数据
  const nextPageData = () => {
    // -1 表示没有后续数据了
    if (pageOffset > -1) {
      // 新的数据
      const res = getData(pageOffset, pageSize);
      if (res.length) {
        setList(list.concat(res));
        // 模拟更新页码, 超过10页，设置为最后一页
        if (pageOffset >= 9) {
          setPageOffset(-1);
        } else {
          // 每次请求，模拟增加1页
          setPageOffset((prev) => prev + 1);
        }
      }
    }
  };

  // 分组响应
  const handleGroup = (id: string, index: number) => {
    const data = Array.from(list);
    if (groups[id]) {
      data.splice(index + 1, groups[id].length);
      setGroups((prevState) => {
        delete prevState[id];
        return prevState;
      });
    } else {
      const newData = makeData(2).map((o) => {
        return {
          ...o,
          group: true,
        };
      });
      setGroups((prevState) => ({ ...prevState, [id]: newData }));
      data.splice(index + 1, 0, ...newData);
    }
    setList(data);
  };

  useLayoutEffect(() => {
    initData();
  }, []);

  // 初始化
  const initData = () => {
    const arr = getData(0, pageSize);
    if (arr.length) {
      // 更新数据
      setList(arr);
      // 更新页码
      setPageOffset(1);
    }
  };

  // 所有列的渲染方法
  const lineRender = (row: IPerson, index: number) => {
    const icon = !row.group && (groups[row.id] ? '⏬' : '⏩');
    return (
      <div
        className={cx('flex h-full w-full items-center px-3', !row.group && 'cursor-pointer')}
        onClick={() => !row.group && handleGroup(row.id, index)}
      >
        <span className={cx('truncate', row.group && 'pl-5')}>
          {icon} {row.name} - {row.age} - {row.status} - {row.city} - {row.phone}
        </span>
      </div>
    );
  };

  // 渲染滚动行（滚动的时候，不显示原始内容，显示这个替代行内容）
  // const scrollingRender = (index: number) => {
  //   return <div className="w-full">Scrolling {index}</div>;
  // };

  // 空态图
  const emptyDom = useMemo(
    () => (
      <div className="flex h-full w-full items-center justify-center bg-[#f6f6f6] text-gray-500">
        Empty Table
      </div>
    ),
    []
  );

  return (
    <div className="flex h-screen w-full flex-col p-2">
      <div className="navbar flex justify-between bg-neutral px-8 text-neutral-content">
        <div className="select-none text-xl">React Window List</div>
        <div className="gap-2">
          <a className="btn" onClick={initData}>
            刷新数据
          </a>
        </div>
      </div>

      <div className="flex-1">
        <VirtualList
          fixedTopCount={2}
          rowHeight={45}
          list={list}
          emptyNode={emptyDom}
          nextPage={nextPageData}
          lineRender={lineRender}
          // scrollingRender={scrollingRender}
        />
      </div>
    </div>
  );
};

export default List;
