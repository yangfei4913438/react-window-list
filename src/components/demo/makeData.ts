import Mockjs from 'mockjs';

export interface IPerson {
  id: string;
  group: boolean;
  name: string;
  age: number;
  status: '已婚' | '未婚';
  region: string;
  city: string;
  email: string;
  phone: number;
  visits: number;
  ip: string;
  last_visit: string;
}

export function makeData(lens: number): IPerson[] {
  const mock_data = {
    [`data|${lens}`]: [
      {
        id: '@id',
        group: false,
        name: '@cname',
        age: '@integer(18,60)',
        'status|1': ['已婚', '未婚'],
        region: '@region',
        city: '@city(true)',
        email: '@email',
        phone: '@integer(13)',
        visits: '@integer(0,1000)',
        ip: '@ip',
        last_visit: '@datetime("yyyy-MM-dd HH:mm:ss")',
      },
    ],
  };
  const result = Mockjs.mock(mock_data);

  return result.data;
}
