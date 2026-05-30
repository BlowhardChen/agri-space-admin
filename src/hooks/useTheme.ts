import { useEffect } from "react";
import { ThemeConfigProp } from "@/redux/interface";
import lightThemeHref from "@/styles/theme/theme-default.less?url";
import darkThemeHref from "@/styles/theme/theme-dark.less?url";

const THEME_STYLESHEET_SELECTOR = "link[data-type='theme']";
const DYNAMIC_PRIMARY_STYLE_ID = "agri-dynamic-primary-style";
const DEFAULT_PRIMARY_COLOR = "#379446";
const DEFAULT_PRIMARY_HOVER_COLOR = "#43a454";
const DEFAULT_PRIMARY_ACTIVE_COLOR = "#2e7d3a";
const DEFAULT_AGRI_BG_COLOR = "#f4f7f2";
const DEFAULT_AGRI_DARK_COLOR = "#102a1a";
const DEFAULT_AGRI_TEXT_COLOR = "#1f2b22";
const DEFAULT_AGRI_BORDER_COLOR = "#d7ded2";

const normalizeHexColor = (color?: string) => {
	if (!color) return DEFAULT_PRIMARY_COLOR;
	const normalizedColor = color.trim();
	if (/^#[0-9a-fA-F]{6}$/.test(normalizedColor)) return normalizedColor;
	if (/^#[0-9a-fA-F]{3}$/.test(normalizedColor)) {
		return normalizedColor
			.slice(1)
			.split("")
			.map(item => item + item)
			.join("")
			.replace(/^/, "#");
	}
	return DEFAULT_PRIMARY_COLOR;
};

const hexToRgb = (color: string) => {
	const normalizedColor = normalizeHexColor(color).slice(1);
	return {
		r: parseInt(normalizedColor.slice(0, 2), 16),
		g: parseInt(normalizedColor.slice(2, 4), 16),
		b: parseInt(normalizedColor.slice(4, 6), 16)
	};
};

const mixColor = (color: string, targetColor: string, weight: number) => {
	const source = hexToRgb(color);
	const target = hexToRgb(targetColor);
	const nextWeight = Math.max(0, Math.min(1, weight));
	const toHex = (value: number) => Math.round(value).toString(16).padStart(2, "0");
	return `#${toHex(source.r + (target.r - source.r) * nextWeight)}${toHex(source.g + (target.g - source.g) * nextWeight)}${toHex(
		source.b + (target.b - source.b) * nextWeight
	)}`;
};

const setPrimaryColorVariables = (primaryColor?: string) => {
	const color = normalizeHexColor(primaryColor);
	const root = document.documentElement;
	const { r, g, b } = hexToRgb(color);
	const isDefaultPrimary = color.toLowerCase() === DEFAULT_PRIMARY_COLOR;
	const hoverColor = isDefaultPrimary ? DEFAULT_PRIMARY_HOVER_COLOR : mixColor(color, "#ffffff", 0.18);
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
};

const ensureDynamicPrimaryStyle = () => {
	let styleElement = document.head.querySelector<HTMLStyleElement>(`#${DYNAMIC_PRIMARY_STYLE_ID}`);

	if (!styleElement) {
		styleElement = document.createElement("style");
		styleElement.id = DYNAMIC_PRIMARY_STYLE_ID;
		document.head.appendChild(styleElement);
	}

	return styleElement;
};

const setDynamicPrimaryStyle = () => {
	const styleElement = ensureDynamicPrimaryStyle();

	styleElement.textContent = `
		a,
		.ant-btn-link,
		.ant-tabs-tab:hover,
		.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn,
		.ant-menu-light .ant-menu-item:hover,
		.ant-menu-light .ant-menu-submenu-title:hover,
		.ant-menu-light .ant-menu-item-active,
		.ant-menu-light .ant-menu-submenu-active,
		.ant-menu-light .ant-menu-item-selected,
		.ant-menu-light .ant-menu-submenu-selected,
		.ant-menu-light .ant-menu-submenu-selected > .ant-menu-submenu-title {
			color: var(--agri-primary) !important;
		}

		.ant-btn-primary,
		.ant-switch-checked,
		.ant-checkbox-checked .ant-checkbox-inner,
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

		.ant-btn-primary,
		.ant-switch-checked,
		.ant-checkbox-checked .ant-checkbox-inner,
		.ant-radio-inner::after,
		.ant-tabs-ink-bar,
		.ant-menu-dark .ant-menu-item-selected,
		.ant-menu-dark .ant-menu-submenu-selected,
		.ant-menu-light .ant-menu-item-selected {
			background-color: var(--agri-primary) !important;
		}

		.ant-menu-light .ant-menu-item-selected {
			background-color: var(--agri-primary-soft-color) !important;
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

		.ant-btn-primary:hover,
		.ant-btn-primary:focus,
		.ant-switch-checked:hover {
			border-color: var(--agri-primary-hover) !important;
			background-color: var(--agri-primary-hover) !important;
		}

		.ant-btn-primary:active {
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
		.ant-select:not(.ant-select-disabled):hover .ant-select-selector,
		.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
		.ant-picker:hover,
		.ant-picker-focused {
			border-color: var(--agri-primary) !important;
		}

		.ant-input:focus,
		.ant-input-focused,
		.ant-input-affix-wrapper-focused,
		.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector,
		.ant-picker-focused {
			box-shadow: 0 0 0 2px var(--agri-primary-soft-color) !important;
		}
	`;
};

const ensureThemeLink = (theme: "light" | "dark", href: string) => {
	const selector = `link[data-type="theme"][data-theme="${theme}"]`;
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
	const { weakOrGray, isDark, primary } = themeConfig;

	const initTheme = () => {
		const root = document.documentElement;
		root.style.filter = weakOrGray === "weak" ? "invert(80%)" : weakOrGray === "gray" ? "grayscale(1)" : "";
		root.dataset.theme = isDark ? "dark" : "light";
		setPrimaryColorVariables(primary);

		ensureThemeLink("light", lightThemeHref);
		ensureThemeLink("dark", darkThemeHref);

		document.querySelectorAll<HTMLLinkElement>(THEME_STYLESHEET_SELECTOR).forEach(node => {
			const shouldEnable = node.dataset.theme === (isDark ? "dark" : "light");
			node.media = shouldEnable ? "all" : "not all";
		});

		setDynamicPrimaryStyle();
	};

	useEffect(() => {
		initTheme();
	}, [weakOrGray, isDark, primary]);

	return {
		initTheme
	};
};

export default useTheme;
