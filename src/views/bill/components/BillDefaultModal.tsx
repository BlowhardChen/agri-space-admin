import { useEffect } from "react";
import { Alert, Col, Descriptions, Form, Input, Modal, Row, Select } from "antd";
import type { BillDefaultForm, BillRecord } from "@/api/interface/bill";

/** 违约账单生成弹窗属性。 */
interface BillDefaultModalProps {
	visible: boolean;
	record?: BillRecord;
	confirming: boolean;
	onClose: () => void;
	onConfirm: (values: BillDefaultForm) => void;
}

/** 违约账单表单视图字段。 */
type DefaultFormValues = Omit<BillDefaultForm, "id">;

/** 展示收款信息并收集违约原因和处理方式。 */
const BillDefaultModal = ({ visible, record, confirming, onClose, onConfirm }: BillDefaultModalProps) => {
	// 创建弹窗独立使用的违约信息表单。
	const [form] = Form.useForm<DefaultFormValues>();

	useEffect(() => {
		// 打开新的账单时清理上一次填写的数据。
		if (visible) form.resetFields();
	}, [form, record, visible]);

	/** 校验表单并补充当前账单标识。 */
	const submit = (values: DefaultFormValues) => {
		if (!record) return;
		onConfirm({ id: record.id, ...values });
	};

	// 渲染违约风险提示、农户资料和处理表单。
	return (
		<Modal
			title="生成违约账单"
			visible={visible}
			width={720}
			okText="生成"
			cancelText="取消"
			confirmLoading={confirming}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{/* 当前账单违约处理提示 */}
			<Alert
				type="warning"
				showIcon
				message={`将根据账单金额 ¥${Number(record?.amount || 0).toFixed(2)} 生成违约账单，请核对收款信息。`}
			/>
			{/* 农户收款资料 */}
			<Descriptions bordered size="small" column={2} className="bill-dialog-summary">
				<Descriptions.Item label="收款人姓名">{record?.farmerName}</Descriptions.Item>
				<Descriptions.Item label="手机号码">{record?.mobile}</Descriptions.Item>
				<Descriptions.Item label="身份证号">{record?.cardid}</Descriptions.Item>
				<Descriptions.Item label="银行卡号">{record?.bankAccount}</Descriptions.Item>
			</Descriptions>
			{/* 违约原因和后续处理表单 */}
			<Form form={form} layout="vertical" onFinish={submit}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="defaultReason" label="违约原因" rules={[{ required: true, message: "请选择违约原因" }]}>
							<Select
								placeholder="请选择"
								options={[
									{ value: "土地征收", label: "土地征收" },
									{ value: "农户提前收回土地", label: "农户提前收回土地" },
									{ value: "合同解除", label: "合同解除" },
									{ value: "其他", label: "其他" }
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="processingMethod" label="打款方式" rules={[{ required: true, message: "请选择打款方式" }]}>
							<Select
								placeholder="请选择"
								options={[
									{ value: "原支付渠道退回", label: "原支付渠道退回" },
									{ value: "线下转账", label: "线下转账" },
									{ value: "暂不打款", label: "暂不打款" }
								]}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					name="defaultRemark"
					label="备注"
					rules={[
						{ required: true, message: "请输入违约备注" },
						{ max: 200, message: "最多输入 200 个字符" }
					]}
				>
					<Input.TextArea rows={3} showCount maxLength={200} placeholder="请输入违约说明" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default BillDefaultModal;
