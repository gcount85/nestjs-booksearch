// common.ts와 각 환경별 환경 변수를 합치는 config.ts 파일 생성

import common from './common';
import local from './local';
import dev from './dev';
import prod from './prod';

const phase = process.env.NODE_ENV;

let conf = {};
if (phase === 'local') {
  conf = local;
} else if (phase === 'dev') {
  conf = dev;
} else if (phase === 'prod') {
  conf = prod;
}

// common과 conf에서 받은 값을 합쳐서 결괏값으로 주는 함수를 반환한다
export default () => ({ ...common, ...conf });
