/// <reference types="vite/client" />

// 声明 moment 本地化文件
declare module 'moment/dist/locale/zh-cn' {
  const content: any;
  export default content;
}

// 声明 virtual:svg-icons-register
declare module 'virtual:svg-icons-register' {
  const content: any;
  export default content;
}

// 声明 vite-plugin-eslint
declare module 'vite-plugin-eslint' {
  const content: any;
  export default content;
}
