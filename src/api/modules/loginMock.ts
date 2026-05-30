import { ResultEnum } from "@/enums/httpEnum";
import { localGet, localSet } from "@/utils/util";
import { Login, ResultData } from "@/api/interface";

const MOCK_USERS_STORAGE_KEY = "agri-space-mock-users";
const MOCK_TOKEN_PREFIX = "mock-token-";

interface MockUser {
	username: string;
	password: string;
	phone: string;
	createdAt: string;
}

const DEFAULT_USERS: MockUser[] = [
	{
		username: "admin",
		password: "e10adc3949ba59abbe56e057f20f883e",
		phone: "13800000000",
		createdAt: "2026-01-01T00:00:00.000Z"
	}
];

const FALLBACK_AUTH_BUTTONS: Login.ResAuthButtons = {
	useHooks: {
		add: true,
		delete: true,
		edit: true
	}
};

const FALLBACK_MENU_LIST: Menu.MenuOptions[] = [
	{
		path: "/home/index",
		title: "首页",
		icon: "HomeOutlined"
	},
	{
		path: "/dashboard",
		title: "Dashboard",
		icon: "DashboardOutlined",
		children: [
			{
				path: "/dashboard/dataVisualize",
				title: "数据可视化"
			},
			{
				path: "/dashboard/embedded",
				title: "内嵌页面"
			}
		]
	},
	{
		path: "/form",
		title: "表单 Form",
		icon: "FormOutlined",
		children: [
			{
				path: "/form/basicForm",
				title: "基础 Form"
			},
			{
				path: "/form/validateForm",
				title: "校验 Form"
			},
			{
				path: "/form/dynamicForm",
				title: "动态 Form"
			}
		]
	},
	{
		path: "/echarts",
		title: "Echarts",
		icon: "AreaChartOutlined",
		children: [
			{
				path: "/echarts/waterChart",
				title: "水型图"
			},
			{
				path: "/echarts/columnChart",
				title: "柱状图"
			},
			{
				path: "/echarts/lineChart",
				title: "折线图"
			},
			{
				path: "/echarts/pieChart",
				title: "饼图"
			},
			{
				path: "/echarts/radarChart",
				title: "雷达图"
			},
			{
				path: "/echarts/nestedChart",
				title: "嵌套环形图"
			}
		]
	},
	{
		path: "/assembly",
		title: "常用组件",
		icon: "AppstoreOutlined",
		children: [
			{
				path: "/assembly/guide",
				title: "引导页"
			},
			{
				path: "/assembly/svgIcon",
				title: "SVG 图标"
			},
			{
				path: "/assembly/selectIcon",
				title: "Icon 选择"
			},
			{
				path: "/assembly/batchImport",
				title: "批量导入数据"
			}
		]
	},
	{
		path: "/menu",
		title: "嵌套菜单",
		icon: "MenuOutlined",
		children: [
			{
				path: "/menu/menu1",
				title: "菜单1"
			},
			{
				path: "/menu/menu2",
				title: "菜单2",
				children: [
					{
						path: "/menu/menu2/menu21",
						title: "菜单2-1"
					},
					{
						path: "/menu/menu2/menu22",
						title: "菜单2-2",
						children: [
							{
								path: "/menu/menu2/menu22/menu221",
								title: "菜单2-2-1"
							},
							{
								path: "/menu/menu2/menu22/menu222",
								title: "菜单2-2-2"
							}
						]
					},
					{
						path: "/menu/menu2/menu23",
						title: "菜单2-3"
					}
				]
			},
			{
				path: "/menu/menu3",
				title: "菜单3"
			}
		]
	},
	{
		path: "/proTable",
		title: "超级表格",
		icon: "TableOutlined",
		children: [
			{
				path: "/proTable/useHooks",
				title: "使用 Hooks"
			},
			{
				path: "/proTable/useComponent",
				title: "使用 Component"
			}
		]
	},
	{
		path: "/link",
		title: "外部链接",
		icon: "LinkOutlined",
		children: [
			{
				path: "/link/gitee",
				title: "Gitee 仓库"
			},
			{
				path: "/link/github",
				title: "GitHub 仓库"
			},
			{
				path: "/link/juejin",
				title: "掘金文档"
			},
			{
				path: "/link/myBlog",
				title: "个人博客"
			}
		]
	}
];

const createSuccessResponse = <T>(data: T, msg = "success"): Promise<ResultData<T>> =>
	Promise.resolve({
		code: String(ResultEnum.SUCCESS),
		msg,
		data
	});

const createErrorResponse = (msg: string) =>
	Promise.reject({
		code: String(ResultEnum.ERROR),
		msg
	});

const readMockUsers = (): MockUser[] => {
	const localUsers = localGet(MOCK_USERS_STORAGE_KEY);
	if (!Array.isArray(localUsers) || !localUsers.length) {
		localSet(MOCK_USERS_STORAGE_KEY, DEFAULT_USERS);
		return DEFAULT_USERS;
	}
	return localUsers;
};

const writeMockUsers = (users: MockUser[]) => {
	localSet(MOCK_USERS_STORAGE_KEY, users);
};

const createMockToken = (username: string) => `${MOCK_TOKEN_PREFIX}${username}`;

export const isMockToken = (token?: string) => Boolean(token?.startsWith(MOCK_TOKEN_PREFIX));

export const loginWithMockUser = async (params: Login.ReqLoginForm): Promise<ResultData<Login.ResLogin>> => {
	const users = readMockUsers();
	const currentUser = users.find(user => user.username === params.username);
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

export const registerMockUser = async (params: Login.ReqRegisterForm): Promise<ResultData<{ username: string }>> => {
	const users = readMockUsers();
	const duplicatedUser = users.find(user => user.username === params.username || user.phone === params.phone);
	if (duplicatedUser) {
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

export const getMockAuthButtons = async (): Promise<ResultData<Login.ResAuthButtons>> => {
	return createSuccessResponse(FALLBACK_AUTH_BUTTONS);
};

export const getMockMenuList = async (): Promise<ResultData<Menu.MenuOptions[]>> => {
	return createSuccessResponse(FALLBACK_MENU_LIST);
};
