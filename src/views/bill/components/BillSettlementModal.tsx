import { useEffect } from "react";
import { Alert, Col, DatePicker, Descriptions, Form, Input, Modal, Row, Select } from "antd";
import moment from "moment";
import type { Moment } from "moment";
import type { BillPaymentMethod, BillRecord, BillSettlementForm } from "@/api/interface/bill";

/** 账单结算确认弹窗属性。 */
interface BillSettlementModalProps {
	visible: boolean;
	record?: BillRecord;
	confirming: boolean;
	onClose: () => void;
	onConfirm: (values: BillSettlementForm) => void;
}

/** 账单结算表单视图字段。 */
interface SettlementFormValues {
	paidAt: Moment;
	paymentMethod: BillPaymentMethod;
	paymentChannel: string;
	payer: string;
	remark?: string;
}

/** 收集账单付款信息并确认结算。 */
const BillSettlementModal = ({ visible, record, confirming, onClose, onConfirm }: BillSettlementModalProps) => {
	// 创建弹窗独立使用的结算表单。
	const [form] = Form.useForm<SettlementFormValues>();

	useEffect(() => {
		// 每次打开时恢复便于演示的默认结算信息。
		if (!visible) return;
		form.setFieldsValue({
			paidAt: moment(),
			paymentMethod: "bank",
			paymentChannel: "中国建设银行银企直联",
			payer: "财务管理员",
			remark: record?.remark
		});
	}, [form, record, visible]);

	/** 校验并转换结算表单字段。 */
	const submit = (values: SettlementFormValues) => {
		if (!record) return;
		onConfirm({
			id: record.id,
			paidAt: values.paidAt.format("YYYY-MM-DD HH:mm:ss"),
			paymentMethod: values.paymentMethod,
			paymentChannel: values.paymentChannel,
			payer: values.payer,
			remark: values.remark
		});
	};

	// 渲染收款提示、账户概要和结算表单。
	return (
		<Modal
			title="确认账单结算"
			visible={visible}
			width={720}
			okText="确认结算"
			cancelText="取消"
			confirmLoading={confirming}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{/* 账单金额与收款人概要 */}
			<Alert
				type="info"
				showIcon
				message={`将为 ${record?.farmerName || "当前农户"} 结算 ¥${Number(record?.amount || 0).toFixed(2)}`}
			/>
			<Descriptions bordered size="small" column={2} className="bill-dialog-summary">
				<Descriptions.Item label="账单编号">{record?.billNo}</Descriptions.Item>
				<Descriptions.Item label="合同编号">{record?.contractNo}</Descriptions.Item>
				<Descriptions.Item label="银行卡号">{record?.bankAccount}</Descriptions.Item>
				<Descriptions.Item label="开户行">{record?.openBank}</Descriptions.Item>
			</Descriptions>
			{/* 结算业务表单 */}
			<Form form={form} layout="vertical" onFinish={submit}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="paidAt" label="结算时间" rules={[{ required: true, message: "请选择结算时间" }]}>
							<DatePicker showTime style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="paymentMethod" label="打款方式" rules={[{ required: true, message: "请选择打款方式" }]}>
							<Select
								options={[
									{ value: "bank", label: "银行打款" },
									{ value: "cash", label: "现金支付" },
									{ value: "other", label: "其他" }
								]}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="paymentChannel" label="支付渠道" rules={[{ required: true, message: "请输入支付渠道" }]}>
							<Input maxLength={60} placeholder="请输入支付渠道" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="payer" label="打款人" rules={[{ required: true, message: "请输入打款人" }]}>
							<Input maxLength={30} placeholder="请输入打款人" />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item name="remark" label="备注" rules={[{ max: 200, message: "最多输入 200 个字符" }]}>
					<Input.TextArea rows={3} showCount maxLength={200} placeholder="请输入结算备注" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default BillSettlementModal;
