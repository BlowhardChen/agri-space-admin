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

/** 维护主题抽屉可选择的布局模式。 */
const layoutOptions: { key: LayoutMode; label: string }[] = [
	{ key: "vertical", label: "纵向" },
	{ key: "classic", label: "经典" },
	{ key: "transverse", label: "横向" },
	{ key: "columns", label: "多栏" }
];

/** 维护主题抽屉可选择的预设主色。 */
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

/** 校验并规范化主题色输入值。 */
const normalizeColorValue = (color?: string) => {
	if (color && /^#[0-9a-fA-F]{6}$/.test(color)) return color;
	return themeColorOptions[0].color;
};

/** 渲染布局、主题色和界面显示配置抽屉。 */
const Theme = (props: any) => {
	// 维护当前浮层显示状态。
	const [visible, setVisible] = useState<boolean>(false);
	// 读取主题更新和侧栏折叠操作。
	const { setThemeConfig, updateCollapse } = props;
	// 读取侧栏折叠状态。
	const { isCollapse } = props.menu;
	// 读取当前全局主题配置。
	const { themeConfig } = props.global;
	// 读取灰度模式、面包屑、标签页和页脚显示配置。
	const { weakOrGray, breadcrumb, tabs, footer } = themeConfig;
	// 读取当前启用的布局模式。
	const currentLayout = themeConfig.layout ?? "vertical";
	// 保存当前有效的六位主题主色。
	const currentPrimary = normalizeColorValue(themeConfig.primary);

	/** 切换灰度或弱色显示模式。 */
	const setWeakOrGray = (checked: boolean, theme: string) => {
		if (checked) return setThemeConfig({ ...themeConfig, weakOrGray: theme });
		setThemeConfig({ ...themeConfig, weakOrGray: "" });
	};

	/** 更新指定界面区域的隐藏配置。 */
	const onChange = (checked: boolean, keyName: string) => {
		return setThemeConfig({ ...themeConfig, [keyName]: !checked });
	};

	/** 校验并应用用户输入的主题主色。 */
	const handlePrimaryColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setThemeConfig({ ...themeConfig, primary: event.target.value });
	};

	// 渲染 `Theme` 的 JSX 模板。
	return (
		<>
			<i
				className="icon-style iconfont icon-zhuti"
				onClick={
					/* 打开主题与布局配置抽屉。 */ () => {
						setVisible(true);
					}
				}
			></i>
			<Drawer
				title="布局设置"
				closable={true}
				closeIcon={<CloseOutlined />}
				onClose={
					/* 关闭主题与布局配置抽屉。 */ () => {
						setVisible(false);
					}
				}
				visible={visible}
				width={320}
				mask={false}
				className={`theme-drawer ${themeConfig.isDark ? "theme-drawer--dark" : "theme-drawer--light"}`}
			>
				{/* 选择后台整体布局结构。 */}
				<Divider className="divider">
					<AppstoreOutlined />
					布局样式
				</Divider>
				<div className="layout-type-list">
					{layoutOptions.map(
						/* 根据当前集合项生成对应的模板或数据。 */ item => {
							// 判断当前配置项是否处于选中状态。
							const isActive = currentLayout === item.key;
							// 渲染当前主题配置项。
							return (
								<div
									key={item.key}
									className={`layout-type-card layout-type-card--${item.key} ${isActive ? "is-active" : ""}`.trim()}
									onClick={
										/* 应用用户选择的主题配置。 */ () => {
											setThemeConfig({ ...themeConfig, layout: item.key });
										}
									}
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
						}
					)}
				</div>

				{/* 选择预设主色、自定义主色和明暗视觉模式。 */}
				<Divider className="divider">
					<FireOutlined />
					全局主题
				</Divider>
				<div className="theme-color-panel">
					<div className="theme-color-panel__title">主题色</div>
					<div className="theme-color-list">
						{themeColorOptions.map(
							/* 根据当前集合项生成对应的模板或数据。 */ item => {
								// 判断当前配置项是否处于选中状态。
								const isActive = currentPrimary.toLowerCase() === item.color.toLowerCase();
								// 渲染当前主题配置项。
								return (
									<button
										key={item.color}
										type="button"
										className={`theme-color-item ${isActive ? "is-active" : ""}`.trim()}
										style={{ backgroundColor: item.color }}
										title={item.label}
										aria-label={`切换主题色为${item.label}`}
										onClick={/* 应用用户选择的主题配置。 */ () => setThemeConfig({ ...themeConfig, primary: item.color })}
									>
										{isActive && <CheckOutlined />}
									</button>
								);
							}
						)}
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
						onChange={
							/* 切换全局灰度显示模式。 */ e => {
								setWeakOrGray(e, "gray");
							}
						}
					/>
				</div>
				<div className="theme-item">
					<span>色弱模式</span>
					<Switch
						checked={weakOrGray === "weak"}
						onChange={
							/* 切换全局色弱显示模式。 */ e => {
								setWeakOrGray(e, "weak");
							}
						}
					/>
				</div>
				<br />
				{/* 控制菜单、面包屑、标签栏和页脚的显示状态。 */}
				<Divider className="divider">
					<SettingOutlined />
					界面设置
				</Divider>
				<div className="theme-item">
					<span>菜单折叠</span>
					<Switch
						checked={isCollapse}
						onChange={
							/* 切换侧边菜单折叠状态。 */ e => {
								updateCollapse(e);
							}
						}
					/>
				</div>
				<div className="theme-item">
					<span>面包屑导航</span>
					<Switch
						checked={!breadcrumb}
						onChange={
							/* 切换面包屑导航显示状态。 */ e => {
								onChange(e, "breadcrumb");
							}
						}
					/>
				</div>
				<div className="theme-item">
					<span>标签栏</span>
					<Switch
						checked={!tabs}
						onChange={
							/* 切换页面标签栏显示状态。 */ e => {
								onChange(e, "tabs");
							}
						}
					/>
				</div>
				<div className="theme-item">
					<span>页脚</span>
					<Switch
						checked={!footer}
						onChange={
							/* 切换布局页脚显示状态。 */ e => {
								onChange(e, "footer");
							}
						}
					/>
				</div>
			</Drawer>
		</>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setThemeConfig, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(Theme);
