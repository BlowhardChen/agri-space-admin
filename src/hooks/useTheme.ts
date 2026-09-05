import { useEffect } from "react";
import { ThemeConfigProp } from "@/redux/interface";
import lightThemeHref from "@/styles/theme/theme-default.less?url";
import darkThemeHref from "@/styles/theme/theme-dark.less?url";

/** 定位需要切换的主题样式表链接。 */
const THEME_STYLESHEET_SELECTOR = "link[data-type='theme']";
/** 标识运行时生成的主题色样式节点。 */
const DYNAMIC_PRIMARY_STYLE_ID = "agri-dynamic-primary-style";
/** 定义系统默认主题主色。 */
const DEFAULT_PRIMARY_COLOR = "#379446";
/** 定义默认主色的悬浮态颜色。 */
const DEFAULT_PRIMARY_HOVER_COLOR = "#43a454";
/** 定义默认主色的按下态颜色。 */
const DEFAULT_PRIMARY_ACTIVE_COLOR = "#2e7d3a";
/** 定义农业主题的默认页面背景色。 */
const DEFAULT_AGRI_BG_COLOR = "#f4f7f2";
/** 定义农业主题的默认深色文本。 */
const DEFAULT_AGRI_DARK_COLOR = "#102a1a";
/** 定义农业主题的默认正文颜色。 */
const DEFAULT_AGRI_TEXT_COLOR = "#1f2b22";
/** 定义农业主题的默认边框色。 */
const DEFAULT_AGRI_BORDER_COLOR = "#d7ded2";

/** 将三位或六位十六进制颜色规范为统一格式。 */
const normalizeHexColor = (color?: string) => {
	if (!color) return DEFAULT_PRIMARY_COLOR;
	// 保存校验后的六位十六进制颜色。
	const normalizedColor = color.trim();
	if (/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) return normalizedColor;
	if (/^#[0-9a-fA-F]{3}$/.test(normalizedColor)) {
		return normalizedColor
			.slice(1)
			.split("")
			.map(/* 根据当前集合项生成对应的模板或数据。 */ item => item + item)
			.join("")
			.replace(/^/, "#");
	}
	return DEFAULT_PRIMARY_COLOR;
};

/** 将十六进制颜色转换为 RGB 分量。 */
const hexToRgb = (color: string) => {
	// 保存校验后的六位十六进制颜色。
	const normalizedColor = normalizeHexColor(color).slice(1);
	return {
		r: parseInt(normalizedColor.slice(0, 2), 16),
		g: parseInt(normalizedColor.slice(2, 4), 16),
		b: parseInt(normalizedColor.slice(4, 6), 16)
	};
};

/** 按权重混合两个十六进制颜色。 */
const mixColor = (color: string, targetColor: string, weight: number) => {
	// 解析待混合的源颜色 RGB 分量。
	const source = hexToRgb(color);
	// 解析待混合的目标颜色 RGB 分量。
	const target = hexToRgb(targetColor);
	// 将混色权重限制在零到一之间。
	const nextWeight = Math.max(0, Math.min(1, weight));
	/** 将颜色分量转换为两位十六进制字符串。 */
	const toHex = (value: number) => Math.round(value).toString(16).padStart(2, "0");
	return `#${toHex(source.r + (target.r - source.r) * nextWeight)}${toHex(source.g + (target.g - source.g) * nextWeight)}${toHex(
		source.b + (target.b - source.b) * nextWeight
	)}`;
};

/** 计算并写入全局主题色 CSS 变量。 */
const setPrimaryColorVariables = (primaryColor?: string) => {
	// 保存规范化后的主题颜色。
	const color = normalizeHexColor(primaryColor);
	// 获取文档根元素以写入 CSS 主题变量。
	const root = document.documentElement;
	// 读取主题色的红、绿、蓝通道值。
	const { r, g, b } = hexToRgb(color);
	// 判断当前主色是否为系统默认值。
	const isDefaultPrimary = color.toLowerCase() === DEFAULT_PRIMARY_COLOR;
	// 计算主题主色的悬浮态颜色。
	const hoverColor = isDefaultPrimary ? DEFAULT_PRIMARY_HOVER_COLOR : mixColor(color, "#ffffff", 0.18);
	// 计算主题主色的按下态颜色。
	const activeColor = isDefaultPrimary ? DEFAULT_PRIMARY_ACTIVE_COLOR : mixColor(color, "#000000", 0.12);

	root.style.setProperty("--agri-primary", color);
	root.style.setProperty("--agri-primary-hover", hoverColor);
	root.style.setProperty("--agri-primary-active", activeColor);
	root.style.setProperty("--agri-bg", DEFAULT_AGRI_BG_COLOR);
	root.style.setProperty("--agri-dark", DEFAULT_AGRI_DARK_COLOR);
	root.style.setProperty("--agri-text", DEFAULT_AGRI_TEXT_COLOR);
	root.style.setProperty("--agri-border", DEFAULT_AGRI_BORDER_COLOR);
	root.style.setProperty("--agri-primary-color", color);
	root.style.setProperty("--agri-primary-hover-color", hoverColor);
	root.style.setProperty("--agri-primary-active-color", activeColor);
	root.style.setProperty("--agri-primary-soft-color", `rgb(${r} ${g} ${b} / 12%)`);
	root.style.setProperty("--agri-primary-soft-dark-color", `rgb(${r} ${g} ${b} / 18%)`);
	root.style.setProperty(
		"--agri-primary-border-color",
		isDefaultPrimary ? DEFAULT_AGRI_BORDER_COLOR : mixColor(color, "#ffffff", 0.2)
	);
	// 同步 Ant Design 4 变量别名，供现有页面样式和组件内部变量共同使用。
	root.style.setProperty("--ant-primary-color", color);
	root.style.setProperty("--ant-primary-color-hover", hoverColor);
	root.style.setProperty("--ant-primary-color-active", activeColor);
	root.style.setProperty("--ant-primary-color-outline", `rgb(${r} ${g} ${b} / 20%)`);
	root.style.setProperty("--ant-primary-1", `rgb(${r} ${g} ${b} / 8%)`);
	root.style.setProperty("--ant-primary-2", `rgb(${r} ${g} ${b} / 16%)`);
};

/** 创建或复用动态主题色样式节点。 */
const ensureDynamicPrimaryStyle = () => {
	// 获取或创建动态主题色样式节点。
	let styleElement = document.head.querySelector<HTMLStyleElement>(`#${DYNAMIC_PRIMARY_STYLE_ID}`);

	if (!styleElement) {
		styleElement = document.createElement("style");
		styleElement.id = DYNAMIC_PRIMARY_STYLE_ID;
		document.head.appendChild(styleElement);
	}

	return styleElement;
};

/** 写入动态主题色覆盖样式。 */
const setDynamicPrimaryStyle = () => {
	// 获取或创建动态主题色样式节点。
	const styleElement = ensureDynamicPrimaryStyle();

	styleElement.textContent = `
		a,
		.ant-btn-link:not(.ant-btn-dangerous),
		.ant-btn-default:not(.ant-btn-dangerous):not([disabled]):hover,
		.ant-btn-default:not(.ant-btn-dangerous):not([disabled]):focus,
		.ant-btn-dashed:not(.ant-btn-dangerous):not([disabled]):hover,
		.ant-btn-dashed:not(.ant-btn-dangerous):not([disabled]):focus,
		.ant-radio-button-wrapper:not(.ant-radio-button-wrapper-disabled):hover,
		.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled),
		.ant-pagination-item-active a,
		.ant-pagination-item:hover a,
		.ant-pagination-prev:hover .ant-pagination-item-link,
		.ant-pagination-next:hover .ant-pagination-item-link,
		.ant-picker-header button:hover,
		.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner,
		.ant-picker-today-btn,
		.ant-select-item-option-selected:not(.ant-select-item-option-disabled) .ant-select-item-option-state,
		.ant-dropdown-menu-item-selected,
		.ant-dropdown-menu-submenu-title-selected,
		.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected,
		.ant-tree .ant-tree-node-content-wrapper:hover,
		.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon,
		.ant-anchor-link-active > .ant-anchor-link-title,
		.ant-tabs-tab:hover,
		.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn,
		.ant-menu-light .ant-menu-item:hover,
		.ant-menu-light .ant-menu-submenu-title:hover,
		.ant-menu-light .ant-menu-item-active,
		.ant-menu-light .ant-menu-submenu-active,
		.ant-menu-light .ant-menu-item-selected,
		.ant-menu-light .ant-menu-submenu-selected,
		.ant-menu-light .ant-menu-submenu-selected > .ant-menu-submenu-title,
		.ant-menu .ant-menu-submenu:hover > .ant-menu-submenu-title > .ant-menu-submenu-expand-icon,
		.ant-menu .ant-menu-submenu:hover > .ant-menu-submenu-title > .ant-menu-submenu-arrow,
		.ant-menu .ant-menu-submenu-active > .ant-menu-submenu-title > .ant-menu-submenu-expand-icon,
		.ant-menu .ant-menu-submenu-active > .ant-menu-submenu-title > .ant-menu-submenu-arrow,
		.ant-menu .ant-menu-submenu-selected > .ant-menu-submenu-title > .ant-menu-submenu-expand-icon,
		.ant-menu .ant-menu-submenu-selected > .ant-menu-submenu-title > .ant-menu-submenu-arrow {
			color: var(--agri-primary) !important;
		}

		.ant-btn-primary:not(.ant-btn-dangerous),
		.ant-btn-default:not(.ant-btn-dangerous):not([disabled]):hover,
		.ant-btn-default:not(.ant-btn-dangerous):not([disabled]):focus,
		.ant-btn-dashed:not(.ant-btn-dangerous):not([disabled]):hover,
		.ant-btn-dashed:not(.ant-btn-dangerous):not([disabled]):focus,
		.ant-switch-checked,
		.ant-checkbox-checked .ant-checkbox-inner,
		.ant-checkbox-indeterminate .ant-checkbox-inner,
		.ant-radio-checked .ant-radio-inner,
		.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled),
		.ant-pagination-item:hover,
		.ant-pagination-prev:hover .ant-pagination-item-link,
		.ant-pagination-next:hover .ant-pagination-item-link,
		.ant-input-number:hover,
		.ant-input-number-focused,
		.ant-slider-handle,
		.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open),
		.ant-upload.ant-upload-select-picture-card:hover,
		.ant-upload.ant-upload-drag:not(.ant-upload-disabled):hover,
		.ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before,
		.ant-steps-item-process .ant-steps-item-icon,
		.ant-timeline-item-head-blue,
		.ant-radio-inner::after,
		.ant-pagination-item-active,
		.ant-tabs-ink-bar,
		.ant-menu-dark .ant-menu-item-selected,
		.ant-menu-dark .ant-menu-item-selected > a,
		.ant-menu-dark .ant-menu-item-selected > span,
		.ant-menu-light .ant-menu-item-selected::after,
		.ant-menu-light .ant-menu-submenu-selected::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected::after {
			border-color: var(--agri-primary) !important;
		}

		.ant-btn-primary:not(.ant-btn-dangerous):not(.ant-btn-background-ghost),
		.ant-spin-dot-item,
		.ant-switch-checked,
		.ant-checkbox-checked .ant-checkbox-inner,
		.ant-checkbox-indeterminate .ant-checkbox-inner::after,
		.ant-radio-inner::after,
		.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled),
		.ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
		.ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
		.ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner,
		.ant-slider-track,
		.ant-slider:hover .ant-slider-track,
		.ant-progress-bg,
		.ant-steps-item-process .ant-steps-item-icon,
		.ant-badge-status-processing,
		.ant-pagination-item-active,
		.ant-anchor-ink-ball,
		.ant-tabs-ink-bar,
		.ant-menu-dark .ant-menu-item-selected,
		.ant-menu-dark .ant-menu-submenu-selected,
		.ant-menu-light .ant-menu-item-selected {
			background-color: var(--agri-primary) !important;
		}

		.ant-menu-light .ant-menu-item-selected {
			background-color: var(--agri-primary-soft-color) !important;
		}

		.ant-select-item-option-selected:not(.ant-select-item-option-disabled),
		.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected,
		.ant-picker-cell-in-view.ant-picker-cell-in-range::before,
		.ant-picker-cell-in-view.ant-picker-cell-range-start:not(.ant-picker-cell-range-start-single)::before,
		.ant-picker-cell-in-view.ant-picker-cell-range-end:not(.ant-picker-cell-range-end-single)::before {
			background-color: var(--agri-primary-soft-color) !important;
		}

		.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
			color: #fff !important;
		}

		.ant-pagination-item-active a,
		.ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
		.ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
		.ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
			color: #fff !important;
		}

		.ant-menu-inline .ant-menu-item::after,
		.ant-menu-vertical .ant-menu-item::after,
		.ant-menu-vertical-left .ant-menu-item::after,
		.ant-menu-vertical-right .ant-menu-item::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-active::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-active::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected::after,
		.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected::after {
			border-color: var(--agri-primary) !important;
		}

		.ant-btn-primary:not(.ant-btn-dangerous):not(.ant-btn-background-ghost):hover,
		.ant-btn-primary:not(.ant-btn-dangerous):not(.ant-btn-background-ghost):focus,
		.ant-switch-checked:hover,
		.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
			border-color: var(--agri-primary-hover) !important;
			background-color: var(--agri-primary-hover) !important;
		}

		.ant-btn-primary:not(.ant-btn-dangerous):not(.ant-btn-background-ghost):active {
			border-color: var(--agri-primary-active) !important;
			background-color: var(--agri-primary-active) !important;
		}

		.ant-checkbox-wrapper:hover .ant-checkbox-inner,
		.ant-checkbox:hover .ant-checkbox-inner,
		.ant-checkbox-input:focus + .ant-checkbox-inner,
		.ant-radio-wrapper:hover .ant-radio,
		.ant-radio:hover .ant-radio-inner,
		.ant-radio-input:focus + .ant-radio-inner,
		.ant-input:hover,
		.ant-input:focus,
		.ant-input-focused,
		.ant-input-affix-wrapper:hover,
		.ant-input-affix-wrapper-focused,
		.ant-input-number:hover,
		.ant-input-number-focused,
		.ant-select:not(.ant-select-disabled):hover .ant-select-selector,
		.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
		.ant-picker:hover,
		.ant-picker-focused {
			border-color: var(--agri-primary) !important;
		}

		.ant-input:focus,
		.ant-input-focused,
		.ant-input-affix-wrapper-focused,
		.ant-input-number-focused,
		.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
		.ant-picker-focused {
			box-shadow: 0 0 0 2px var(--agri-primary-soft-color) !important;
		}

		.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before,
		.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover::before,
		.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after,
		.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
			background-color: var(--agri-primary) !important;
		}

		.ant-btn-background-ghost.ant-btn-primary:not(.ant-btn-dangerous),
		.ant-btn-background-ghost.ant-btn-primary:not(.ant-btn-dangerous):hover,
		.ant-btn-background-ghost.ant-btn-primary:not(.ant-btn-dangerous):focus {
			color: var(--agri-primary) !important;
			background-color: transparent !important;
			border-color: var(--agri-primary) !important;
		}

		.ant-badge-status-processing::after {
			border-color: var(--agri-primary) !important;
		}
	`;
};

/** 创建或复用外部主题样式表链接节点。 */
const ensureThemeLink = (theme: "light" | "dark", href: string) => {
	// 生成目标主题样式表的 DOM 选择器。
	const selector = `link[data-type="theme"][data-theme="${theme}"]`;
	// 获取或创建当前主题的样式表链接节点。
	let linkElement = document.head.querySelector<HTMLLinkElement>(selector);

	if (!linkElement) {
		linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		linkElement.href = href;
		linkElement.dataset.type = "theme";
		linkElement.dataset.theme = theme;
		document.head.appendChild(linkElement);
	}

	return linkElement;
};

/**
 * @description 鍏ㄥ眬涓婚璁剧疆
 */
const useTheme = (themeConfig: ThemeConfigProp) => {
	// 读取灰度模式、明暗主题和主色配置。
	const { weakOrGray, isDark, primary } = themeConfig;

	/** 根据全局主题配置初始化页面样式。 */
	const initTheme = () => {
		// 获取文档根元素以写入 CSS 主题变量。
		const root = document.documentElement;
		root.style.filter = weakOrGray === "weak" ? "invert(80%)" : weakOrGray === "gray" ? "grayscale(1)" : "";
		root.dataset.theme = isDark ? "dark" : "light";
		setPrimaryColorVariables(primary);

		ensureThemeLink("light", lightThemeHref);
		ensureThemeLink("dark", darkThemeHref);

		document.querySelectorAll<HTMLLinkElement>(THEME_STYLESHEET_SELECTOR).forEach(
			/* 遍历当前集合并处理每一项。 */ node => {
				// 判断当前视觉模式是否需要启用。
				const shouldEnable = node.dataset.theme === (isDark ? "dark" : "light");
				node.media = shouldEnable ? "all" : "not all";
			}
		);

		setDynamicPrimaryStyle();
	};

	useEffect(
		/* 在主题配置变化时同步页面主题样式。 */ () => {
			initTheme();
		},
		[weakOrGray, isDark, primary]
	);

	return {
		initTheme
	};
};

export default useTheme;
