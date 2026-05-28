import { useEffect } from "react";
import { ThemeConfigProp } from "@/redux/interface";

const THEME_STYLESHEET_SELECTOR = "link[data-type='theme']";

/**
 * @description 鍏ㄥ眬涓婚璁剧疆
 */
const useTheme = (themeConfig: ThemeConfigProp) => {
	const { weakOrGray, isDark } = themeConfig;

	const initTheme = () => {
		const root = document.documentElement;
		root.style.filter = weakOrGray === "weak" ? "invert(80%)" : weakOrGray === "gray" ? "grayscale(1)" : "";

		document.querySelectorAll(THEME_STYLESHEET_SELECTOR).forEach(node => node.remove());

		const linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		linkElement.href = isDark ? "/src/styles/theme/theme-dark.less" : "/src/styles/theme/theme-default.less";
		linkElement.dataset.type = "theme";
		document.head.appendChild(linkElement);
	};

	useEffect(() => {
		initTheme();
	}, [weakOrGray, isDark]);

	return {
		initTheme
	};
};

export default useTheme;
