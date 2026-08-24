declare global {
  var __DEBUG__: boolean;

  function __ASSERT__(cond: boolean, msg: string): asserts cond;
}

globalThis.__DEBUG__ = true;
globalThis.__ASSERT__ =  function __ASSERT__(cond, msg) {
  if( ! cond )
    throw new Error(msg);
}

export {};