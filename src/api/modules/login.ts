import { Login } from "@/api/interface/index";
import { AUTH_API } from "@/api/config/servicePort";
import http from "@/api";
import { getMockAuthButtons, getMockMenuList, loginWithMockUser, registerMockUser } from "./loginMock";
import md5 from "js-md5";

/** 判断当前环境是否启用本地模拟认证。 */
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH !== "false";
/** 判断当前请求是否跳过全屏加载。 */
const withoutFullScreenLoading = { headers: { noLoading: true } };

/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: Login.ReqLoginForm) => {
	if (useMockAuth) return loginWithMockUser({ ...params, password: md5(params.password) });
	return http.post<Login.ResLogin>(AUTH_API.login, params, withoutFullScreenLoading);
};

// * 用户注册接口
export const registerApi = (params: Login.ReqRegisterForm) => {
	if (useMockAuth) return registerMockUser({ ...params, password: md5(params.password) });
	return http.post<Login.ResRegister>(AUTH_API.register, params, withoutFullScreenLoading);
};

// * 获取按钮权限
export const getAuthorButtons = () => {
	if (useMockAuth) return getMockAuthButtons();
	return http.get<Login.ResAuthButtons>(AUTH_API.buttons);
};

// * 获取菜单列表
export const getMenuList = () => {
	if (useMockAuth) return getMockMenuList();
	return http.get<Menu.MenuOptions[]>(AUTH_API.menu);
};
