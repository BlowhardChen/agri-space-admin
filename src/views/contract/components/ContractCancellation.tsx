import { useEffect, useState } from "react";
import { Alert, Form, Input, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ContractBill, ContractRecord } from "@/api/interface/contract";
import { getContractBills } from "@/api/modules/contract";

/** 合同作废确认弹窗属性。 */
interface ContractCancellationProps {
	visible: boolean;
	record?: ContractRecord;
	confirming: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
}

/** 作废原因表单字段。 */
interface CancellationValues {
	reason: string;
}

/** 账单明细表格列。 */
const BILL_COLUMNS: ColumnsType<ContractBill> = [
	{ title: "账单期数", dataIndex: "period", width: 110 },
	{ title: "最晚付款时间", dataIndex: "dueDate", width: 150 },
	{ title: "付款金额（元）", dataIndex: "amount", width: 140, render: value => Number(value).toFixed(2) },
	{
		title: "结算状态",
		dataIndex: "settlementStatus",
		width: 120,
		render: value => <Tag color={value === "已结算" ? "green" : "orange"}>{value}</Tag>
	},
	{
		title: "违约账单",
		dataIndex: "defaultStatus",
		width: 110,
		render: value => <Tag color={value === "正常" ? "default" : "red"}>{value}</Tag>
	}
];

/** 展示关联账单并收集作废原因的确认弹窗。 */
const ContractCancellation = ({ visible, record, confirming, onClose, onConfirm }: ContractCancellationProps) => {
	// 保存作废表单、关联账单和读取状态。
	const [form] = Form.useForm<CancellationValues>();
	const [bills, setBills] = useState<ContractBill[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// 打开弹窗时读取当前合同的 mock 账单明细。
		if (!visible || !record) return;
		let active = true;
		setLoading(true);
		getContractBills(record)
			.then(response => {
				if (active) setBills(response.data || []);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [record, visible]);

	// 渲染账单影响提示、明细表格和作废原因。
	return (
		<Modal
			title="账单确认"
			visible={visible}
			width={820}
			okText="确认作废"
			cancelText="取消"
			okButtonProps={{ danger: true }}
			confirmLoading={confirming}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{/* 作废影响和关联合同提示 */}
			<Alert type="warning" showIcon message={`作废合同 ${record?.contractNo || ""} 后，未结算账单将停止后续处理。`} />
			{/* 合同账单明细 */}
			<Table<ContractBill>
				rowKey="id"
				columns={BILL_COLUMNS}
				dataSource={bills}
				loading={loading}
				pagination={false}
				size="small"
				className="contract-bill-table"
			/>
			{/* 作废原因 */}
			<Form form={form} layout="vertical" onFinish={values => onConfirm(values.reason)}>
				<Form.Item
					name="reason"
					label="作废原因"
					rules={[
						{ required: true, message: "请填写作废原因" },
						{ max: 200, message: "最多输入 200 个字符" }
					]}
				>
					<Input.TextArea rows={3} showCount maxLength={200} placeholder="请输入作废原因" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ContractCancellation;
