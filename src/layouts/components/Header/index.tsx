import { Layout } from "antd";
import AvatarIcon from "./components/AvatarIcon";
import CollapseIcon from "./components/CollapseIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import AssemblySize from "./components/AssemblySize";
import Language from "./components/Language";
import Theme from "./components/Theme";
import Fullscreen from "./components/Fullscreen";
import "./index.less";

/** 组合后台头部工具栏。 */
const LayoutHeader = ({ showCollapse = true }: { showCollapse?: boolean }) => {
	// 读取 Ant Design 布局的头部组件。
	const { Header } = Layout;

	// 渲染 `LayoutHeader` 的 JSX 模板。
	return (
		<Header>
			<div className="header-lf">
				{showCollapse ? <CollapseIcon /> : null}
				<BreadcrumbNav />
			</div>
			<div className="header-ri">
				<AssemblySize />
				<Language />
				<Theme />
				<Fullscreen />
				<span className="username">Admin</span>
				<AvatarIcon />
			</div>
		</Header>
	);
};

export default LayoutHeader;
