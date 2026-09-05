import { Login, ResultData } from "@/api/interface/index";
import { AUTH_API } from "@/api/config/servicePort";
import http from "@/api";
import { getMockAuthButtons, getMockMenuList, loginWithMockUser, registerMockUser } from "./loginMock";
import md5 from "js-md5";

/** 判断当前环境是否启用本地模拟认证。 */
export const isMockAuthEnabled = import.meta.env.VITE_USE_MOCK_AUTH !== "false";
/** 判断当前请求是否跳过全屏加载。 */
const withoutFullScreenLoading = { headers: { noLoading: true } };

/** 描述地约正式服返回的路由元数据。 */
interface DiyueRouteMeta {
	title?: string;
	icon?: string;
	isLink?: string;
	isHide?: boolean;
}

/** 描述地约正式服返回的原始菜单节点。 */
interface DiyueRoute {
	path: string;
	name?: string;
	meta?: DiyueRouteMeta;
	children?: DiyueRoute[];
}

/** 拼接后端相对路由路径，兼容父子菜单都可能省略斜杠的情况。 */
const resolveRoutePath = (path: string, parentPath = "") => {
	if (path.startsWith("/")) return path;
	const basePath = parentPath.replace(/\/$/, "");
	return `${basePath}/${path}`.replace(/\/+/g, "/");
};

/** 将地约路由数据适配为当前后台菜单、面包屑与鉴权共用的结构。 */
const adaptDiyueRoutes = (routes: DiyueRoute[], parentPath = ""): Menu.MenuOptions[] =>
	routes
		.filter(route => !route.meta?.isHide)
		.map(route => {
			const path = resolveRoutePath(route.path, parentPath);
			const children = route.children?.length ? adaptDiyueRoutes(route.children, path) : undefined;
			return {
				path,
				title: route.meta?.title || route.name || path,
				icon: route.meta?.icon,
				isLink: route.meta?.isLink,
				children
			};
		});

/** 将正式服路由结果适配为当前请求层的标准响应。 */
const adaptDiyueMenuResponse = (response: ResultData<DiyueRoute[]>): ResultData<Menu.MenuOptions[]> => ({
	...response,
	data: adaptDiyueRoutes(response.data || [])
});

/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: Login.ReqLoginForm) => {
	if (isMockAuthEnabled) return loginWithMockUser({ ...params, password: md5(params.password) });
	return http.post<Login.ResLogin>(AUTH_API.login, params, withoutFullScreenLoading);
};

// * 用户注册接口
export const registerApi = (params: Login.ReqRegisterForm) => {
	if (isMockAuthEnabled) return registerMockUser({ ...params, password: md5(params.password) });
	return Promise.reject(new Error("正式服不支持自助注册，请联系系统管理员开通账号"));
};

// * 获取按钮权限
export const getAuthorButtons = () => {
	if (isMockAuthEnabled) return getMockAuthButtons();
	return Promise.resolve<ResultData<Login.ResAuthButtons>>({ code: 200, msg: "success", data: {} });
};

// * 获取菜单列表
export const getMenuList = async (): Promise<ResultData<Menu.MenuOptions[]>> => {
	if (isMockAuthEnabled) return getMockMenuList();
	const response = await http.get<DiyueRoute[]>(AUTH_API.menu);
	return adaptDiyueMenuResponse(response);
};
