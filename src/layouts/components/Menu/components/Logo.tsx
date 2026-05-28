import logo from "@/assets/images/logo.png";
import { connect } from "react-redux";

const Logo = (props: any) => {
	const collapsed = props.collapsed ?? props.isCollapse;
	const title = props.title ?? "Agri-Space-Admin";

	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{!collapsed && title ? <h2 className="logo-text">{title}</h2> : null}
		</div>
	);
};

const mapStateToProps = (state: any) => state.menu;
export default connect(mapStateToProps)(Logo) as any;
