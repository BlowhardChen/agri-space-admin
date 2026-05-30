import { Drawer, Divider, Switch } from "antd";
import { useState, type ChangeEvent } from "react";
import { connect } from "react-redux";
import {
	AppstoreOutlined,
	CheckCircleFilled,
	CheckOutlined,
	CloseOutlined,
	FireOutlined,
	SettingOutlined
} from "@ant-design/icons";
import { setThemeConfig } from "@/redux/modules/global/action";
import { updateCollapse } from "@/redux/modules/menu/action";
import SwitchDark from "@/components/SwitchDark";
import type { LayoutMode } from "@/layouts/utils";

const layoutOptions: { key: LayoutMode; label: string }[] = [
	{ key: "vertical", label: "纵向" },
	{ key: "classic", label: "经典" },
	{ key: "transverse", label: "横向" },
	{ key: "columns", label: "多栏" }
];

const themeColorOptions = [
	{ color: "#379446", label: "农域绿" },
	{ color: "#1890ff", label: "拂晓蓝" },
	{ color: "#722ed1", label: "酱紫" },
	{ color: "#13c2c2", label: "明青" },
	{ color: "#eb2f96", label: "洋红" },
	{ color: "#fa8c16", label: "日暮" },
	{ color: "#f5222d", label: "薄暮" },
	{ color: "#2f54eb", label: "极客蓝" }
];

const normalizeColorValue = (color?: string) => {
	if (color && /^#[0-9a-fA-F]{6}$/.test(color)) return color;
	return themeColorOptions[0].color;
};

const Theme = (props: any) => {
	const [visible, setVisible] = useState<boolean>(false);
	const { setThemeConfig, updateCollapse } = props;
	const { isCollapse } = props.menu;
	const { themeConfig } = props.global;
	const { weakOrGray, breadcrumb, tabs, footer } = themeConfig;
	const currentLayout = themeConfig.layout ?? "vertical";
	const currentPrimary = normalizeColorValue(themeConfig.primary);

	const setWeakOrGray = (checked: boolean, theme: string) => {
		if (checked) return setThemeConfig({ ...themeConfig, weakOrGray: theme });
		setThemeConfig({ ...themeConfig, weakOrGray: "" });
	};

	const onChange = (checked: boolean, keyName: string) => {
		return setThemeConfig({ ...themeConfig, [keyName]: !checked });
	};

	const handlePrimaryColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setThemeConfig({ ...themeConfig, primary: event.target.value });
	};

	return (
		<>
			<i
				className="icon-style iconfont icon-zhuti"
				onClick={() => {
					setVisible(true);
				}}
			></i>
			<Drawer
				title="布局设置"
				closable={true}
				closeIcon={<CloseOutlined />}
				onClose={() => {
					setVisible(false);
				}}
				visible={visible}
				width={320}
				mask={false}
				className={`theme-drawer ${themeConfig.isDark ? "theme-drawer--dark" : "theme-drawer--light"}`}
			>
				<Divider className="divider">
					<AppstoreOutlined />
					布局样式
				</Divider>
				<div className="layout-type-list">
					{layoutOptions.map(item => {
						const isActive = currentLayout === item.key;
						return (
							<div
								key={item.key}
								className={`layout-type-card layout-type-card--${item.key} ${isActive ? "is-active" : ""}`.trim()}
								onClick={() => {
									setThemeConfig({ ...themeConfig, layout: item.key });
								}}
							>
								<div className="layout-type-card__canvas">
									<span className="layout-type-card__header"></span>
									<span className="layout-type-card__aside"></span>
									<span className="layout-type-card__aside-light"></span>
									<span className="layout-type-card__content"></span>
								</div>
								<CheckCircleFilled className="layout-type-card__check" />
								<span className="layout-type-card__label">{item.label}</span>
							</div>
						);
					})}
				</div>

				<Divider className="divider">
					<FireOutlined />
					全局主题
				</Divider>
				<div className="theme-color-panel">
					<div className="theme-color-panel__title">主题色</div>
					<div className="theme-color-list">
						{themeColorOptions.map(item => {
							const isActive = currentPrimary.toLowerCase() === item.color.toLowerCase();
							return (
								<button
									key={item.color}
									type="button"
									className={`theme-color-item ${isActive ? "is-active" : ""}`.trim()}
									style={{ backgroundColor: item.color }}
									title={item.label}
									aria-label={`切换主题色为${item.label}`}
									onClick={() => setThemeConfig({ ...themeConfig, primary: item.color })}
								>
									{isActive && <CheckOutlined />}
								</button>
							);
						})}
					</div>
					<div className="theme-color-custom">
						<span>自定义</span>
						<label className="theme-color-picker" title="选择自定义主题色">
							<input type="color" value={currentPrimary} onChange={handlePrimaryColorChange} />
							<span className="theme-color-picker__preview" style={{ backgroundColor: currentPrimary }} />
							<span className="theme-color-picker__value">{currentPrimary.toUpperCase()}</span>
						</label>
					</div>
				</div>
				<div className="theme-item">
					<span>暗黑模式</span>
					<SwitchDark />
				</div>
				<div className="theme-item">
					<span>灰色模式</span>
					<Switch
						checked={weakOrGray === "gray"}
						onChange={e => {
							setWeakOrGray(e, "gray");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>色弱模式</span>
					<Switch
						checked={weakOrGray === "weak"}
						onChange={e => {
							setWeakOrGray(e, "weak");
						}}
					/>
				</div>
				<br />
				<Divider className="divider">
					<SettingOutlined />
					界面设置
				</Divider>
				<div className="theme-item">
					<span>菜单折叠</span>
					<Switch
						checked={isCollapse}
						onChange={e => {
							updateCollapse(e);
						}}
					/>
				</div>
				<div className="theme-item">
					<span>面包屑导航</span>
					<Switch
						checked={!breadcrumb}
						onChange={e => {
							onChange(e, "breadcrumb");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>标签栏</span>
					<Switch
						checked={!tabs}
						onChange={e => {
							onChange(e, "tabs");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>页脚</span>
					<Switch
						checked={!footer}
						onChange={e => {
							onChange(e, "footer");
						}}
					/>
				</div>
			</Drawer>
		</>
	);
};

const mapStateToProps = (state: any) => state;
const mapDispatchToProps = { setThemeConfig, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(Theme);
