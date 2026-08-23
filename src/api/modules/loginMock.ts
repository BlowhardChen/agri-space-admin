import { ResultEnum } from "@/enums/httpEnum";
import { localGet, localSet } from "@/utils/util";
import { Login, ResultData } from "@/api/interface";
import { AUTH_MENU_LIST } from "@/config/authMenu";

/** 定义模拟用户列表的本地存储键。 */
const MOCK_USERS_STORAGE_KEY = "agri-space-mock-users";
/** 定义本地模拟访问令牌的固定前缀。 */
const MOCK_TOKEN_PREFIX = "mock-token-";

interface MockUser {
	username: string;
	password: string;
	phone: string;
	createdAt: string;
}

/** 提供本地模拟登录的初始用户列表。 */
const DEFAULT_USERS: MockUser[] = [
	{
		username: "admin",
		password: "e10adc3949ba59abbe56e057f20f883e",
		phone: "13800000000",
		createdAt: "2026-01-01T00:00:00.000Z"
	}
];

/** 提供接口不可用时的按钮权限数据。 */
const FALLBACK_AUTH_BUTTONS: Login.ResAuthButtons = {};

/** 提供接口不可用时的农域菜单数据。 */
const FALLBACK_MENU_LIST: Menu.MenuOptions[] = [
	{
		path: "/home/index",
		title: "首页",
		icon: "HomeOutlined"
	},
	...AUTH_MENU_LIST
];

/** 创建符合登录接口约定的成功响应。 */
const createSuccessResponse = <T>(data: T, msg = "success"): Promise<ResultData<T>> =>
	Promise.resolve({
		code: String(ResultEnum.SUCCESS),
		msg,
		data
	});

/** 创建符合登录接口约定的失败响应。 */
const createErrorResponse = (msg: string) =>
	Promise.reject({
		code: String(ResultEnum.ERROR),
		msg
	});

/** 从本地存储读取并校验模拟用户列表。 */
const readMockUsers = (): MockUser[] => {
	// 读取本地存储中的模拟用户原始数据。
	const localUsers = localGet(MOCK_USERS_STORAGE_KEY);
	if (!Array.isArray(localUsers) || !localUsers.length) {
		localSet(MOCK_USERS_STORAGE_KEY, DEFAULT_USERS);
		return DEFAULT_USERS;
	}
	return localUsers;
};

/** 将模拟用户列表写入本地存储。 */
const writeMockUsers = (users: MockUser[]) => {
	localSet(MOCK_USERS_STORAGE_KEY, users);
};

/** 为本地模拟用户生成访问令牌。 */
const createMockToken = (username: string) => `${MOCK_TOKEN_PREFIX}${username}`;

/** 校验本地模拟用户并生成访问令牌。 */
export const loginWithMockUser = async (params: Login.ReqLoginForm): Promise<ResultData<Login.ResLogin>> => {
	// 读取当前可用于认证或注册校验的模拟用户列表。
	const users = readMockUsers();
	// 保存与登录凭据匹配的模拟用户。
	const currentUser = users.find(/* 判断当前集合项是否为目标数据。 */ user => user.username === params.username);
	if (!currentUser || currentUser.password !== params.password) {
		return createErrorResponse("用户名或密码错误");
	}
	return createSuccessResponse(
		{
			access_token: createMockToken(currentUser.username)
		},
		"登录成功"
	);
};

/** 校验并写入新的本地模拟用户。 */
export const registerMockUser = async (params: Login.ReqRegisterForm): Promise<ResultData<{ username: string }>> => {
	// 读取当前可用于认证或注册校验的模拟用户列表。
	const users = readMockUsers();
	// 查找手机号或用户名重复的模拟用户。
	const duplicatedUser = users.find(
		/* 判断当前集合项是否为目标数据。 */ user => user.username === params.username || user.phone === params.phone
	);
	if (duplicatedUser) {
		// 记录模拟用户注册时发生冲突的字段。
		const duplicateField = duplicatedUser.username === params.username ? "用户名" : "手机号";
		return createErrorResponse(`${duplicateField}已存在，请直接登录`);
	}
	writeMockUsers(
		users.concat({
			username: params.username,
			password: params.password,
			phone: params.phone,
			createdAt: new Date().toISOString()
		})
	);
	return createSuccessResponse({ username: params.username }, "注册成功");
};

/** 生成本地开发环境使用的按钮权限映射。 */
export const getMockAuthButtons = async (): Promise<ResultData<Login.ResAuthButtons>> => {
	return createSuccessResponse(FALLBACK_AUTH_BUTTONS);
};

/** 生成本地开发环境使用的菜单树。 */
export const getMockMenuList = async (): Promise<ResultData<Menu.MenuOptions[]>> => {
	return createSuccessResponse(FALLBACK_MENU_LIST);
};
