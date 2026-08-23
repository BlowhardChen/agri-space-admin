import { Breadcrumb } from "antd";
import { useLocation } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";

/** 根据当前路由渲染面包屑导航。 */
const BreadcrumbNav = (props: any) => {
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 读取当前全局主题配置。
	const { themeConfig } = props.global;
	// 读取当前页面的面包屑节点列表。
	const breadcrumbList = props.breadcrumb.breadcrumbList[pathname] || [];

	// 渲染 `BreadcrumbNav` 的 JSX 模板。
	return (
		<>
			{!themeConfig.breadcrumb && (
				<Breadcrumb>
					<Breadcrumb.Item href={`#${HOME_URL}`}>首页</Breadcrumb.Item>
					{breadcrumbList.map(
						/* 根据当前集合项生成对应的模板或数据。 */ (item: string) => {
							// 渲染当前层级对应的面包屑节点。
							return <Breadcrumb.Item key={item}>{item !== "首页" ? item : null}</Breadcrumb.Item>;
						}
					)}
				</Breadcrumb>
			)}
		</>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state;
export default connect(mapStateToProps)(BreadcrumbNav);
