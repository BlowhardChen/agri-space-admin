// 后端微服务端口名
export const PORT1 = "/hooks";
/** 定义系统认证服务的代理地址。 */
export const PORT2 = "/geeker";

/** 定义认证接口的统一路径前缀。 */
export const AUTH_API = {
	login: `${PORT1}/login`,
	register: `${PORT1}/register`,
	buttons: `${PORT1}/auth/buttons`,
	menu: `${PORT1}/menu/list`
} as const;
