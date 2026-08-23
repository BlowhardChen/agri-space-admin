import { RouteObject } from "@/routers/interface";

/**
 * @description 获取localStorage
 * @param {String} key Storage名称
 * @return string
 */
export const localGet = (key: string) => {
	// 读取目标类型在 Object 原型中的类型标记。
	const value = window.localStorage.getItem(key);
	try {
		return JSON.parse(window.localStorage.getItem(key) as string);
	} catch (error) {
		// error 表示本地存储内容无法解析为 JSON 的异常。
		return value;
	}
};

/**
 * @description 存储localStorage
 * @param {String} key Storage名称
 * @param {Any} value Storage值
 * @return void
 */
export const localSet = (key: string, value: any) => {
	window.localStorage.setItem(key, JSON.stringify(value));
};

/**
 * @description 清除localStorage
 * @param {String} key Storage名称
 * @return void
 */
export const localRemove = (key: string) => {
	window.localStorage.removeItem(key);
};

/**
 * @description 清除所有localStorage
 * @return void
 */
export const localClear = () => {
	window.localStorage.clear();
};

/**
 * @description 获取浏览器默认语言
 * @return string
 */
export const getBrowserLang = () => {
	// 读取浏览器首选语言。
	let browserLang = navigator.language ? navigator.language : navigator.browserLanguage;
	// 保存应用支持的浏览器语言值。
	let defaultBrowserLang = "";
	if (browserLang.toLowerCase() === "cn" || browserLang.toLowerCase() === "zh" || browserLang.toLowerCase() === "zh-cn") {
		defaultBrowserLang = "zh";
	} else {
		defaultBrowserLang = "en";
	}
	return defaultBrowserLang;
};

/**
 * @description 获取需要展开的 subMenu
 * @param {String} path 当前访问地址
 * @returns array
 */
export const getOpenKeys = (path: string) => {
	// 保存转换命名格式后的字符串。
	let newStr: string = "";
	// 保存完成去重后的数组。
	let newArr: any[] = [];
	// 保存拆分后的路径片段。
	let arr = path.split("/").map(/* 根据当前集合项生成对应的模板或数据。 */ i => "/" + i);
	// i 表示当前待转换路径片段的索引。
	for (let i = 1; i < arr.length - 1; i++) {
		newStr += arr[i];
		newArr.push(newStr);
	}
	return newArr;
};

/**
 * @description 递归查询对应的路由
 * @param {String} path 当前访问地址
 * @param {Array} routes 路由列表
 * @returns array
 */
export const searchRoute = (path: string, routes: RouteObject[] = []): RouteObject => {
	// 保存当前工具函数计算后的结果。
	let result: RouteObject = {};
	// item 表示当前参与路径匹配的路由节点。
	for (let item of routes) {
		if (item.path === path) return item;
		if (item.children) {
			// 保存当前异步请求返回的业务响应。
			const res = searchRoute(path, item.children);
			if (Object.keys(res).length) result = res;
		}
	}
	return result;
};

/**
 * @description 递归当前路由的 所有 关联的路由，生成面包屑导航栏
 * @param {String} path 当前访问地址
 * @param {Array} menuList 菜单列表
 * @returns array
 */
export const getBreadcrumbList = (path: string, menuList: Menu.MenuOptions[]) => {
	// 记录递归遍历菜单时的当前路径。
	let tempPath: any[] = [];
	try {
		/** 递归查找菜单节点对应的父级路径。 */
		const getNodePath = (node: Menu.MenuOptions) => {
			tempPath.push(node);
			// 找到符合条件的节点，通过throw终止掉递归
			if (node.path === path) {
				throw new Error("GOT IT!");
			}
			if (node.children && node.children.length > 0) {
				// i 表示当前递归检查的子菜单索引。
				for (let i = 0; i < node.children.length; i++) {
					getNodePath(node.children[i]);
				}
				// 当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
				tempPath.pop();
			} else {
				// 找到叶子节点时，删除路径当中的该叶子节点
				tempPath.pop();
			}
		};
		// i 表示当前开始查找路径的根菜单索引。
		for (let i = 0; i < menuList.length; i++) {
			getNodePath(menuList[i]);
		}
	} catch (e) {
		// e 表示找到目标菜单后用于提前结束递归的内部信号。
		return tempPath.map(/* 根据当前集合项生成对应的模板或数据。 */ item => item.title);
	}
};

/**
 * @description 双重递归 找出所有 面包屑 生成对象存到 redux 中，就不用每次都去递归查找了
 * @param {String} menuList 当前菜单列表
 * @returns object
 */
export const findAllBreadcrumb = (menuList: Menu.MenuOptions[]): { [key: string]: any } => {
	// 创建更新面包屑列表的 Redux 派发函数。
	let handleBreadcrumbList: any = {};
	/** 递归遍历菜单树并收集目标节点。 */
	const loop = (menuItem: Menu.MenuOptions) => {
		// 下面判断代码解释 *** !item?.children?.length   ==>   (item.children && item.children.length > 0)
		if (menuItem?.children?.length) menuItem.children.forEach(/* 遍历当前集合并处理每一项。 */ item => loop(item));
		else handleBreadcrumbList[menuItem.path] = getBreadcrumbList(menuItem.path, menuList);
	};
	menuList.forEach(/* 遍历当前集合并处理每一项。 */ item => loop(item));
	return handleBreadcrumbList;
};

/**
 * @description 使用递归处理路由菜单，生成一维数组，做菜单权限判断
 * @param {Array} menuList 所有菜单列表
 * @param {Array} newArr 菜单的一维数组
 * @return array
 */
export function handleRouter(routerList: Menu.MenuOptions[], newArr: string[] = []) {
	routerList.forEach(
		/* 遍历当前集合并处理每一项。 */ (item: Menu.MenuOptions) => {
			typeof item === "object" && item.path && newArr.push(item.path);
			item.children && item.children.length && handleRouter(item.children, newArr);
		}
	);
	return newArr;
}

/**
 * @description 判断数据类型
 * @param {Any} val 需要判断类型的数据
 * @return string
 */
export const isType = (val: any) => {
	if (val === null) return "null";
	if (typeof val !== "object") return typeof val;
	else return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase();
};

/**
 * @description 对象数组深克隆
 * @param {Object} obj 源对象
 * @return object
 */
export const deepCopy = <T>(obj: any): T => {
	// 保存按目标属性完成去重的映射。
	let newObj: any;
	try {
		newObj = obj.push ? [] : {};
	} catch (error) {
		// error 表示源数据不支持数组方式初始化副本的异常。
		newObj = {};
	}
	// attr 表示当前复制的对象属性名。
	for (let attr in obj) {
		if (typeof obj[attr] === "object") {
			newObj[attr] = deepCopy(obj[attr]);
		} else {
			newObj[attr] = obj[attr];
		}
	}
	return newObj;
};

/**
 * @description 生成随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @return number
 */
export function randomNum(min: number, max: number): number {
	// 保存格式化后的两位颜色分量。
	let num = Math.floor(Math.random() * (min - max) + max);
	return num;
}
