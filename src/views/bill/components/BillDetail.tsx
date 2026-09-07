import { Descriptions, Drawer, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BillPaymentMethod, BillPaymentRecord, BillRecord, BillSettlementStatus } from "@/api/interface/bill";

/** 账单详情抽屉属性。 */
interface BillDetailProps {
	visible: boolean;
	record?: BillRecord;
	loading: boolean;
	onClose: () => void;
}

/** 结算状态标签配置。 */
const STATUS_META: Record<BillSettlementStatus, { color: string; text: string }> = {
	pending: { color: "orange", text: "待结算" },
	settled: { color: "green", text: "已结算" },
	overdue: { color: "red", text: "已逾期" },
	cancelled: { color: "default", text: "已取消" }
};

/** 打款方式展示文案。 */
const PAYMENT_METHOD_LABEL: Record<BillPaymentMethod, string> = {
	bank: "银行打款",
	cash: "现金支付",
	other: "其他"
};

/** 账单打款流水表格列。 */
const PAYMENT_COLUMNS: ColumnsType<BillPaymentRecord> = [
	{ title: "打款时间", dataIndex: "paidAt", width: 170 },
	{ title: "打款方式", dataIndex: "method", width: 110, render: value => PAYMENT_METHOD_LABEL[value as BillPaymentMethod] },
	{ title: "渠道", dataIndex: "channel", width: 190 },
	{ title: "打款人", dataIndex: "operator", width: 110 },
	{
		title: "打款结果",
		dataIndex: "result",
		width: 110,
		render: value => <Tag color={value === "success" ? "green" : "red"}>{value === "success" ? "成功" : "失败"}</Tag>
	},
	{ title: "失败原因", dataIndex: "failureReason", width: 180, render: value => value || "—" }
];

/** 展示账单、收款账户、违约信息和打款流水。 */
const BillDetail = ({ visible, record, loading, onClose }: BillDetailProps) => {
	// 渲染右侧账单详情抽屉。
	return (
		<Drawer title="账单详情" visible={visible} width={760} onClose={onClose} destroyOnClose>
			<Spin spinning={loading}>
				{record && (
					<div className="bill-detail">
						{/* 账单编号、金额和当前状态 */}
						<div className="bill-detail-heading">
							<div>
								<strong>{record.billNo}</strong>
								<span>关联合同：{record.contractNo}</span>
							</div>
							<div className="bill-detail-status">
								<strong>¥{record.amount.toFixed(2)}</strong>
								<Tag color={STATUS_META[record.settlementStatus].color}>{STATUS_META[record.settlementStatus].text}</Tag>
							</div>
						</div>
						{/* 账单基础信息 */}
						<Descriptions title="账单信息" bordered size="small" column={2}>
							<Descriptions.Item label="账单期数">{record.period}</Descriptions.Item>
							<Descriptions.Item label="最晚付款时间">{record.dueDate}</Descriptions.Item>
							<Descriptions.Item label="创建人">{record.createName}</Descriptions.Item>
							<Descriptions.Item label="创建时间">{record.createTime}</Descriptions.Item>
							<Descriptions.Item label="备注" span={2}>
								{record.remark || "无"}
							</Descriptions.Item>
						</Descriptions>
						{/* 收款账户信息 */}
						<Descriptions title="收款信息" bordered size="small" column={2}>
							<Descriptions.Item label="农户姓名">{record.farmerName}</Descriptions.Item>
							<Descriptions.Item label="手机号码">{record.mobile}</Descriptions.Item>
							<Descriptions.Item label="身份证号">{record.cardid}</Descriptions.Item>
							<Descriptions.Item label="银行卡号">{record.bankAccount}</Descriptions.Item>
							<Descriptions.Item label="开户行" span={2}>
								{record.openBank}
							</Descriptions.Item>
						</Descriptions>
						{/* 已结算信息 */}
						{record.paidAt && (
							<Descriptions title="结算信息" bordered size="small" column={2}>
								<Descriptions.Item label="结算时间">{record.paidAt}</Descriptions.Item>
								<Descriptions.Item label="打款方式">
									{record.paymentMethod ? PAYMENT_METHOD_LABEL[record.paymentMethod] : "未知"}
								</Descriptions.Item>
								<Descriptions.Item label="支付渠道">{record.paymentChannel || "未知"}</Descriptions.Item>
								<Descriptions.Item label="打款人">{record.payer || "未知"}</Descriptions.Item>
							</Descriptions>
						)}
						{/* 违约账单信息 */}
						{record.defaultStatus === "default" && (
							<Descriptions title="违约账单" bordered size="small" column={2}>
								<Descriptions.Item label="违约金额">
									<strong className="bill-default-amount">¥{Number(record.defaultAmount || 0).toFixed(2)}</strong>
								</Descriptions.Item>
								<Descriptions.Item label="违约原因">{record.defaultReason || "未知"}</Descriptions.Item>
								<Descriptions.Item label="违约备注" span={2}>
									{record.defaultRemark || "无"}
								</Descriptions.Item>
							</Descriptions>
						)}
						{/* 历史打款流水 */}
						<div className="bill-detail-section-title">打款记录</div>
						<Table<BillPaymentRecord>
							rowKey="id"
							columns={PAYMENT_COLUMNS}
							dataSource={record.paymentRecords}
							pagination={false}
							size="small"
							scroll={{ x: 870 }}
						/>
					</div>
				)}
			</Spin>
		</Drawer>
	);
};

export default BillDetail;
