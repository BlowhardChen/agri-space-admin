import { useState, useImperativeHandle, Ref } from "react";
import { Modal, message } from "antd";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void }>;
}

/** 渲染修改密码弹窗并向父组件暴露打开方法。 */
const PasswordModal = (props: Props) => {
	// 维护筛选弹窗显示状态。
	const [isModalVisible, setIsModalVisible] = useState(false);

	useImperativeHandle(
		props.innerRef,
		/* 向父组件暴露弹窗打开方法。 */ () => ({
			showModal
		})
	);

	/** 打开当前弹窗。 */
	const showModal = (params: { name: number }) => {
		console.log(params);
		setIsModalVisible(true);
	};

	/** 校验并提交弹窗表单。 */
	const handleOk = () => {
		setIsModalVisible(false);
		message.success("修改密码成功 🎉🎉🎉");
	};

	/** 关闭弹窗并清理临时表单状态。 */
	const handleCancel = () => {
		setIsModalVisible(false);
	};
	// 渲染 `PasswordModal` 的 JSX 模板。
	return (
		<Modal title="修改密码" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}>
			<p>Some Password...</p>
			<p>Some Password...</p>
			<p>Some Password...</p>
		</Modal>
	);
};
export default PasswordModal;
