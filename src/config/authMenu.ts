/** 集中维护与源项目权限路由一致的业务菜单树。 */
export const AUTH_MENU_LIST: Menu.MenuOptions[] = [
	{
		path: "/land",
		title: "土地管理",
		icon: "EnvironmentOutlined",
		children: [
			{
				path: "/land/msg",
				title: "土地信息"
			},
			{
				path: "/land/village",
				title: "行政村管理"
			}
		]
	},
	{
		path: "/audit",
		title: "审核管理",
		icon: "AuditOutlined"
	},
	{
		path: "/contract",
		title: "合同管理",
		icon: "FileProtectOutlined"
	},
	{
		path: "/bill",
		title: "账单管理",
		icon: "AccountBookOutlined"
	},
	{
		path: "/farm",
		title: "农事管理",
		icon: "DeploymentUnitOutlined",
		children: [
			{
				path: "/farm/map",
				title: "农事地图"
			},
			{
				path: "/farm/scheme",
				title: "农技方案"
			},
			{
				path: "/farm/type",
				title: "农事类型"
			},
			{
				path: "/farm/field",
				title: "农事字段"
			}
		]
	},
	{
		path: "/patrol",
		title: "巡田管理",
		icon: "RadarChartOutlined",
		children: [
			{
				path: "/patrol/task",
				title: "巡田任务"
			},
			{
				path: "/patrol/record",
				title: "巡田记录"
			},
			{
				path: "/patrol/abnormal",
				title: "异常上报"
			}
		]
	},
	{
		path: "/mall",
		title: "农资商城",
		icon: "ShoppingCartOutlined",
		children: [
			{
				path: "/mall/data",
				title: "农资管理"
			},
			{
				path: "/mall/service",
				title: "农服管理",
				children: [
					{
						path: "/mall/service/single",
						title: "单个农服"
					},
					{
						path: "/mall/service/multiple",
						title: "组合农服"
					}
				]
			},
			{
				path: "/mall/order",
				title: "订单管理",
				children: [
					{
						path: "/mall/order/farmData",
						title: "农资订单"
					},
					{
						path: "/mall/order/farmService",
						title: "农服订单"
					}
				]
			}
		]
	},
	{
		path: "/store",
		title: "门店管理",
		icon: "ShopOutlined",
		children: [
			{
				path: "/store/list",
				title: "门店列表"
			},
			{
				path: "/store/configure",
				title: "门店配置",
				children: [
					{
						path: "/store/configure/goods",
						title: "农资商品配置"
					},
					{
						path: "/store/configure/manager",
						title: "区域经理配置"
					}
				]
			}
		]
	},
	{
		path: "/system",
		title: "系统管理",
		icon: "SettingOutlined",
		children: [
			{
				path: "/system/company",
				title: "公司管理"
			},
			{
				path: "/system/user",
				title: "用户管理"
			},
			{
				path: "/system/role",
				title: "角色管理"
			},
			{
				path: "/system/menu",
				title: "菜单管理"
			},
			{
				path: "/system/dict",
				title: "字典管理"
			},
			{
				path: "/system/log",
				title: "日志管理",
				children: [
					{
						path: "/system/log/operlog",
						title: "操作日志"
					},
					{
						path: "/system/log/login-log",
						title: "登录日志"
					}
				]
			}
		]
	}
];

/** 将权限菜单展开为动态路由所需的叶子节点。 */
export const getAuthMenuLeafList = (menuList: Menu.MenuOptions[] = AUTH_MENU_LIST): Menu.MenuOptions[] => {
	return menuList.flatMap(
		/* 递归展开当前菜单分支并汇总叶子节点。 */ item => (item.children?.length ? getAuthMenuLeafList(item.children) : [item])
	);
};
