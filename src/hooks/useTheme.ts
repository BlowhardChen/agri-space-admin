import { ThemeConfigProp } from "@/redux/interface";

/**
 * @description 全局主题设置
 * */
const useTheme = (themeConfig: ThemeConfigProp) => {
	const { weakOrGray, isDark } = themeConfig;
	const initTheme = () => {
		// 灰色和弱色切换
		const body = document.documentElement as HTMLElement;
		if (!weakOrGray) body.setAttribute("style", "");
		if (weakOrGray === "weak") body.setAttribute("style", "filter: invert(80%)");
		if (weakOrGray === "gray") body.setAttribute("style", "filter: grayscale(1)");

		// 切换暗黑模式
		let head = document.getElementsByTagName("head")[0];
		const getStyle = head.getElementsByTagName("style");
		if (getStyle.length > 0) {
			for (let i = 0, l = getStyle.length; i < l; i++) {
				if (getStyle[i]?.getAttribute("data-type") === "dark") getStyle[i].remove();
			}
		}

		// 动态加载主题样式
		const linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		linkElement.href = isDark ? "/src/styles/theme/theme-dark.less" : "/src/styles/theme/theme-default.less";
		linkElement.dataset.type = "dark";
		head.appendChild(linkElement);
	};
	initTheme();

	return {
		initTheme
	};
};

export default useTheme;
