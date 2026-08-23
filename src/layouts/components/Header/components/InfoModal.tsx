import { useState, useImperativeHandle, Ref } from "react";
import { Modal, message } from "antd";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void } | undefined>;
}

/** 渲染用户信息弹窗并向父组件暴露打开方法。 */
const InfoModal = (props: Props) => {
	// 维护当前弹窗显示状态。
	const [modalVisible, setModalVisible] = useState(false);

	useImperativeHandle(
		props.innerRef,
		/* 向父组件暴露弹窗打开方法。 */ () => ({
			showModal
		})
	);

	/** 打开当前弹窗。 */
	const showModal = (params: { name: number }) => {
		console.log(params);
		setModalVisible(true);
	};

	/** 校验并提交弹窗表单。 */
	const handleOk = () => {
		setModalVisible(false);
		message.success("修改用户信息成功 🎉🎉🎉");
	};

	/** 关闭弹窗并清理临时表单状态。 */
	const handleCancel = () => {
		setModalVisible(false);
	};
	// 渲染 `InfoModal` 的 JSX 模板。
	return (
		<Modal title="个人信息" visible={modalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}>
			<p>User Info...</p>
			<p>User Info...</p>
			<p>User Info...</p>
		</Modal>
	);
};
export default InfoModal;
