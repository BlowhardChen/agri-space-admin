import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { getMockAuthButtons, getMockMenuList, isMockToken, loginWithMockUser, registerMockUser } from "./loginMock";
import { store } from "@/redux";

/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: Login.ReqLoginForm) => {
	return loginWithMockUser(params);
};

// * 用户注册接口
export const registerApi = (params: Login.ReqRegisterForm) => {
	return registerMockUser(params);
};

// * 获取按钮权限
export const getAuthorButtons = () => {
	if (isMockToken(store.getState().global.token)) return getMockAuthButtons();
	return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`);
};

// * 获取菜单列表
export const getMenuList = () => {
	if (isMockToken(store.getState().global.token)) return getMockMenuList();
	return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/list`);
};
