import { Tabs, message } from "antd";
import { HomeFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setTabsList } from "@/redux/modules/tabs/action";
import { routerArray } from "@/routers";
import { searchRoute } from "@/utils/util";
import MoreButton from "./components/MoreButton";
import "./index.less";

/** 渲染并维护已访问页面标签。 */
const LayoutTabs = (props: any) => {
	// 读取已访问页面标签列表。
	const { tabsList } = props.tabs;
	// 读取当前全局主题配置。
	const { themeConfig } = props.global;
	// 获取更新已访问标签列表的派发函数。
	const { setTabsList } = props;
	// 读取 Ant Design 标签页内容组件。
	const { TabPane } = Tabs;
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	// 维护表格筛选弹窗中的临时选项。
	const [activeValue, setActiveValue] = useState<string>(pathname);

	useEffect(
		/* 在依赖变化时同步组件副作用，并在必要时执行清理。 */ () => {
			addTabs();
		},
		[pathname]
	);

	// click tabs
	const clickTabs = (path: string) => {
		navigate(path);
	};

	// add tabs
	const addTabs = () => {
		// 查找与当前路径匹配的路由配置。
		const route = searchRoute(pathname, routerArray);
		// 生成完成关闭操作后的标签列表。
		let newTabsList = JSON.parse(JSON.stringify(tabsList));
		if (tabsList.every(/* 判断全部标签是否满足保留条件。 */ (item: any) => item.path !== route.path)) {
			newTabsList.push({ title: route.meta!.title, path: route.path });
		}
		setTabsList(newTabsList);
		setActiveValue(pathname);
	};

	// delete tabs
	const delTabs = (tabPath?: string) => {
		if (tabPath === HOME_URL) return;
		if (pathname === tabPath) {
			tabsList.forEach(
				/* 遍历当前集合并处理每一项。 */ (item: Menu.MenuOptions, index: number) => {
					if (item.path !== pathname) return;
					// 选择关闭当前标签后需要激活的相邻标签。
					const nextTab = tabsList[index + 1] || tabsList[index - 1];
					if (!nextTab) return;
					navigate(nextTab.path);
				}
			);
		}
		message.success("你删除了Tabs标签 😆😆😆");
		setTabsList(tabsList.filter(/* 判断当前集合项是否满足筛选条件。 */ (item: Menu.MenuOptions) => item.path !== tabPath));
	};

	// 渲染 `LayoutTabs` 的 JSX 模板。
	return (
		<>
			{!themeConfig.tabs && (
				/* 展示已访问页面，并允许用户切换或关闭标签。 */
				<div className="tabs">
					<Tabs
						animated
						activeKey={activeValue}
						onChange={clickTabs}
						hideAdd
						type="editable-card"
						onEdit={
							/* 关闭用户点击删除按钮的标签页。 */ path => {
								delTabs(path as string);
							}
						}
					>
						{tabsList.map(
							/* 根据当前集合项生成对应的模板或数据。 */ (item: Menu.MenuOptions) => {
								// 渲染当前已访问页面标签。
								return (
									<TabPane
										key={item.path}
										tab={
											<span>
												{item.path == HOME_URL ? <HomeFilled /> : ""}
												{item.title}
											</span>
										}
										closable={item.path !== HOME_URL}
									></TabPane>
								);
							}
						)}
					</Tabs>
					<MoreButton tabsList={tabsList} delTabs={delTabs} setTabsList={setTabsList}></MoreButton>
				</div>
			)}
		</>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setTabsList };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutTabs);
