import { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import type { ContractRecord } from "@/api/interface/contract";

/** 合同备注弹窗属性。 */
interface ContractRemarkProps {
	visible: boolean;
	record?: ContractRecord;
	saving: boolean;
	onClose: () => void;
	onSave: (remark: string) => void;
}

/** 合同备注表单字段。 */
interface RemarkValues {
	remark: string;
}

/** 新增或修改合同备注。 */
const ContractRemark = ({ visible, record, saving, onClose, onSave }: ContractRemarkProps) => {
	// 保存备注表单实例。
	const [form] = Form.useForm<RemarkValues>();

	useEffect(() => {
		// 打开时回填已有备注，方便继续编辑。
		if (visible) form.setFieldsValue({ remark: record?.remark || "" });
	}, [form, record, visible]);

	// 渲染限制 200 字的备注输入框。
	return (
		<Modal
			title="填写备注"
			visible={visible}
			width={480}
			okText="保存"
			cancelText="取消"
			confirmLoading={saving}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{/* 合同备注表单 */}
			<Form form={form} layout="vertical" onFinish={values => onSave(values.remark)}>
				<Form.Item
					name="remark"
					label="备注"
					rules={[
						{ required: true, message: "请输入备注" },
						{ max: 200, message: "最多输入 200 个字符" }
					]}
				>
					<Input.TextArea rows={4} maxLength={200} showCount placeholder="请输入" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ContractRemark;
