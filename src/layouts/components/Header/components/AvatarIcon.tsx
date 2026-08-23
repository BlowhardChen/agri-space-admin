import { useRef } from "react";
import { Avatar, Modal, Menu, Dropdown, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { resetSession } from "@/redux/modules/global/action";
import PasswordModal from "./PasswordModal";
import InfoModal from "./InfoModal";
import avatar from "@/assets/images/avatar.png";

/** 渲染用户头像菜单并处理个人操作。 */
const AvatarIcon = (props: any) => {
	// 获取退出登录并清理会话的方法。
	const { resetSession } = props;
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();

	interface ModalProps {
		showModal: (params: { name: number }) => void;
	}
	// 引用修改密码弹窗的控制方法。
	const passRef = useRef<ModalProps>(null);
	// 引用用户信息弹窗的控制方法。
	const infoRef = useRef<ModalProps>(null);

	// 退出登录
	const logout = () => {
		Modal.confirm({
			title: "温馨提示 🧡",
			icon: <ExclamationCircleOutlined />,
			content: "是否确认退出登录？",
			okText: "确认",
			cancelText: "取消",
			onOk: /* 清理会话并跳转登录页。 */ () => {
				resetSession();
				message.success("退出登录成功！");
				navigate("/login");
			}
		});
	};

	// Dropdown Menu
	const menu = (
		<Menu
			items={[
				{
					key: "1",
					label: <span className="dropdown-item">首页</span>,
					onClick: /* 跳转系统首页。 */ () => navigate(HOME_URL)
				},
				{
					key: "2",
					label: <span className="dropdown-item">个人信息</span>,
					onClick: /* 打开当前用户信息弹窗。 */ () => infoRef.current!.showModal({ name: 11 })
				},
				{
					key: "3",
					label: <span className="dropdown-item">修改密码</span>,
					onClick: /* 打开修改密码弹窗。 */ () => passRef.current!.showModal({ name: 11 })
				},
				{
					type: "divider"
				},
				{
					key: "4",
					label: <span className="dropdown-item">退出登录</span>,
					onClick: logout
				}
			]}
		></Menu>
	);
	// 渲染 `AvatarIcon` 的 JSX 模板。
	return (
		<>
			<Dropdown overlay={menu} placement="bottom" arrow trigger={["click"]}>
				<Avatar size="large" src={avatar} />
			</Dropdown>
			<InfoModal innerRef={infoRef}></InfoModal>
			<PasswordModal innerRef={passRef}></PasswordModal>
		</>
	);
};

/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { resetSession };
export default connect(null, mapDispatchToProps)(AvatarIcon);
