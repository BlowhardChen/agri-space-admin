import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HOME_URL } from "@/config/config";

/** 渲染标签页批量关闭操作菜单。 */
const MoreButton = (props: any) => {
	// 获取 i18next 文案翻译函数。
	const { t } = useTranslation();
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();

	// close multipleTab
	const closeMultipleTab = (tabPath?: string) => {
		// 创建更新已访问标签列表的操作函数。
		const handleTabsList = props.tabsList.filter(
			/* 判断当前集合项是否满足筛选条件。 */ (item: Menu.MenuOptions) => {
				return item.path === tabPath || item.path === HOME_URL;
			}
		);
		props.setTabsList(handleTabsList);
		tabPath ?? navigate(HOME_URL);
	};

	// 配置当前下拉组件的菜单项和点击行为。
	const menu = (
		<Menu
			items={[
				{
					key: "1",
					label: <span>{t("tabs.closeCurrent")}</span>,
					onClick: /* 关闭当前路由对应的标签。 */ () => props.delTabs(pathname)
				},
				{
					key: "2",
					label: <span>{t("tabs.closeOther")}</span>,
					onClick: /* 仅保留首页和当前标签。 */ () => closeMultipleTab(pathname)
				},
				{
					key: "3",
					label: <span>{t("tabs.closeAll")}</span>,
					onClick: /* 关闭除首页外的全部标签。 */ () => closeMultipleTab()
				}
			]}
		/>
	);
	// 渲染 `MoreButton` 的 JSX 模板。
	return (
		<Dropdown overlay={menu} placement="bottom" arrow={{ pointAtCenter: true }} trigger={["click"]}>
			<Button className="more-button" type="primary" size="small">
				{t("tabs.more")} <DownOutlined />
			</Button>
		</Dropdown>
	);
};
export default MoreButton;
