import { useCallback, useEffect, useState } from "react";
import { Button, Form, InputNumber, Popconfirm, Radio, Space, Tag, message } from "antd";
import type { Moment } from "moment";
import { CheckCircleOutlined, DownloadOutlined, FileTextOutlined, ReloadOutlined, RollbackOutlined } from "@ant-design/icons";
import type {
	BillDefaultForm,
	BillListParams,
	BillPaymentMethod,
	BillRecord,
	BillSettlementForm,
	BillSettlementStatus,
	BillStatusFilter
} from "@/api/interface/bill";
import {
	createDefaultBill,
	downloadBillExport,
	exportBillList,
	getBillDetail,
	getBillList,
	revokeBillSettlement,
	settleBill
} from "@/api/modules/bill";
import TablePro from "@/components/TablePro";
import type { TableProColumn } from "@/components/TablePro";
import BillDefaultModal from "./components/BillDefaultModal";
import BillDetail from "./components/BillDetail";
import BillSettlementModal from "./components/BillSettlementModal";
import "./index.less";

/** 账单 TablePro 搜索表单值，日期和金额范围在提交时转换。 */
interface BillSearchValues {
	billNo?: string;
	contractNo?: string;
	farmerName?: string;
	mobile?: string;
	bankAccount?: string;
	paymentMethod?: BillPaymentMethod;
	beginAmount?: number;
	endAmount?: number;
	dueDate?: [Moment, Moment];
	createTime?: [Moment, Moment];
}

/** 账单状态切换选项。 */
const STATUS_OPTIONS: Array<{ label: string; value: BillStatusFilter }> = [
	{ label: "待结算", value: "pending" },
	{ label: "已结算", value: "settled" },
	{ label: "已逾期", value: "overdue" },
	{ label: "全部", value: "all" }
];

/** 账单结算状态的颜色和文案。 */
const STATUS_META: Record<BillSettlementStatus, { color: string; text: string }> = {
	pending: { color: "orange", text: "待结算" },
	settled: { color: "green", text: "已结算" },
	overdue: { color: "red", text: "已逾期" },
	cancelled: { color: "default", text: "已取消" }
};

/** 付款方式展示文案。 */
const PAYMENT_METHOD_LABEL: Record<BillPaymentMethod, string> = {
	bank: "银行打款",
	cash: "现金支付",
	other: "其他"
};

/** 触发浏览器下载并释放临时对象地址。 */
const saveBlob = (blob: Blob, fileName: string) => {
	// 创建供浏览器下载使用的临时资源地址。
	const url = URL.createObjectURL(blob);
	// 构造无需插入页面的下载链接。
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 账单管理页面，提供筛选、状态分页、结算与违约账单处理。 */
const BillManagement = () => {
	// 保存已应用的查询条件、状态标签和分页参数。
	const [filters, setFilters] = useState<BillListParams>({});
	const [status, setStatus] = useState<BillStatusFilter>("pending");
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 保存列表数据以及查询和写操作状态。
	const [records, setRecords] = useState<BillRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// 保存详情、结算和违约弹层当前关联的账单。
	const [detail, setDetail] = useState<BillRecord>();
	const [detailLoading, setDetailLoading] = useState(false);
	const [settlementRecord, setSettlementRecord] = useState<BillRecord>();
	const [defaultRecord, setDefaultRecord] = useState<BillRecord>();

	/** 加载当前状态、筛选和分页对应的账单列表。 */
	const loadBills = useCallback(async () => {
		setLoading(true);
		try {
			// “全部”标签不向数据层传结算状态。
			const settlementStatus = status === "all" ? undefined : status;
			// 请求当前视图对应的 Mock 账单数据。
			const response = await getBillList({ ...filters, settlementStatus, pageNum, pageSize });
			if (!Array.isArray(response.data?.rows)) throw new Error("账单列表响应格式不正确");
			setRecords(response.data.rows);
			setTotal(response.data.total);
		} catch {
			setRecords([]);
			setTotal(0);
			message.error("账单列表加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [filters, pageNum, pageSize, status]);

	useEffect(() => {
		// 查询参数、分页或业务操作变化后刷新列表。
		void loadBills();
	}, [loadBills, revision]);

	/** 将搜索表单中的范围字段转换为列表接口参数。 */
	const applyFilters = (values: BillSearchValues) => {
		// 从表单值中拆出需要格式化的日期范围。
		const { dueDate, createTime, ...rest } = values;
		setFilters({
			...rest,
			beginDueDate: dueDate?.[0]?.format("YYYY-MM-DD"),
			endDueDate: dueDate?.[1]?.format("YYYY-MM-DD"),
			beginCreateTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endCreateTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
	};

	/** 清空全部筛选条件并回到第一页。 */
	const resetFilters = () => {
		setFilters({});
		setPageNum(1);
	};

	/** 关闭业务弹层并触发列表重新加载。 */
	const refresh = () => {
		setDetail(undefined);
		setSettlementRecord(undefined);
		setDefaultRecord(undefined);
		setRevision(value => value + 1);
	};

	/** 读取完整账单后打开详情抽屉。 */
	const openDetail = async (record: BillRecord) => {
		setDetail(record);
		setDetailLoading(true);
		try {
			// 使用详情接口获取包含打款流水的完整数据。
			const response = await getBillDetail(record.id);
			if (!response.data) throw new Error("缺少账单详情");
			setDetail(response.data);
		} catch {
			message.error("账单详情加载失败，请重试");
		} finally {
			setDetailLoading(false);
		}
	};

	/** 保存账单结算信息。 */
	const confirmSettlement = async (values: BillSettlementForm) => {
		setWorking(true);
		try {
			await settleBill(values);
			message.success("账单结算成功");
			refresh();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "账单结算失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 撤销已结算账单并恢复其待处理状态。 */
	const revokeSettlement = async (record: BillRecord) => {
		setWorking(true);
		try {
			await revokeBillSettlement(record.id);
			message.success("结算状态已撤销");
			refresh();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "撤销失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 保存违约账单信息。 */
	const confirmDefaultBill = async (values: BillDefaultForm) => {
		setWorking(true);
		try {
			await createDefaultBill(values);
			message.success("违约账单生成成功");
			refresh();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "违约账单生成失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 导出当前状态和筛选范围内的账单。 */
	const exportCurrent = async () => {
		setWorking(true);
		try {
			// “全部”状态导出时不限制结算状态。
			const settlementStatus = status === "all" ? undefined : status;
			// 先生成 Mock CSV，再通过统一下载逻辑保存。
			const response = await exportBillList({ ...filters, settlementStatus });
			if (!response.data) throw new Error("未生成导出文件");
			const blob = await downloadBillExport(response.data);
			saveBlob(blob, "账单列表.csv");
			message.success("账单列表导出成功");
		} catch {
			message.error("导出失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	// TablePro 列配置同时驱动账单筛选区和数据表格。
	const columns: Array<TableProColumn<BillRecord, BillSearchValues>> = [
		{ title: "账单编号", dataIndex: "billNo", width: 180, fixed: "left", search: { type: "input" } },
		{ title: "合同编号", dataIndex: "contractNo", width: 170, search: { type: "input" } },
		{ title: "账单期数", dataIndex: "period", width: 110 },
		{ title: "农户姓名", dataIndex: "farmerName", width: 110, search: { type: "input" } },
		{ title: "手机号码", dataIndex: "mobile", width: 140, search: { type: "input" } },
		{ title: "银行卡号", dataIndex: "bankAccount", width: 190, ellipsis: true, search: { type: "input" } },
		{
			title: "付款金额（元）",
			dataIndex: "amount",
			width: 150,
			search: {
				render: () => (
					<div className="bill-range">
						<Form.Item name="beginAmount" noStyle>
							<InputNumber min={0} precision={2} placeholder="最小金额" />
						</Form.Item>
						<span>~</span>
						<Form.Item name="endAmount" noStyle>
							<InputNumber min={0} precision={2} placeholder="最大金额" />
						</Form.Item>
					</div>
				)
			},
			render: value => <strong className="bill-amount">¥{Number(value).toFixed(2)}</strong>
		},
		{ title: "最晚付款时间", dataIndex: "dueDate", width: 140, search: { type: "date-range", key: "dueDate" } },
		{
			title: "付款方式",
			dataIndex: "paymentMethod",
			width: 120,
			search: { type: "select" },
			enum: [
				{ value: "bank", label: "银行打款" },
				{ value: "cash", label: "现金支付" },
				{ value: "other", label: "其他" }
			],
			render: value => (value ? PAYMENT_METHOD_LABEL[value as BillPaymentMethod] : "—")
		},
		{
			title: "结算状态",
			dataIndex: "settlementStatus",
			width: 110,
			render: value => {
				// 获取当前状态对应的标签配置。
				const meta = STATUS_META[value as BillSettlementStatus];
				return <Tag color={meta.color}>{meta.text}</Tag>;
			}
		},
		{
			title: "违约账单",
			dataIndex: "defaultStatus",
			width: 110,
			render: value => <Tag color={value === "default" ? "red" : "default"}>{value === "default" ? "已生成" : "正常"}</Tag>
		},
		{ title: "结算时间", dataIndex: "paidAt", width: 170, render: value => value || "—" },
		{ title: "创建时间", dataIndex: "createTime", width: 170, search: { type: "date-range" } },
		{ title: "创建人", dataIndex: "createName", width: 110 },
		{ title: "备注", dataIndex: "remark", width: 180, ellipsis: true, render: value => value || "—" },
		{
			title: "操作",
			key: "operation",
			width: 300,
			fixed: "right",
			render: (_value, record) => (
				<Space size={2}>
					<Button type="link" icon={<FileTextOutlined />} onClick={() => void openDetail(record)}>
						详情
					</Button>
					{record.settlementStatus === "settled" ? (
						<Popconfirm title="确定撤销该账单的结算状态吗？" onConfirm={() => void revokeSettlement(record)}>
							<Button type="link" icon={<RollbackOutlined />} disabled={working}>
								撤销
							</Button>
						</Popconfirm>
					) : (
						<Button
							type="link"
							icon={<CheckCircleOutlined />}
							disabled={record.settlementStatus === "cancelled"}
							onClick={() => setSettlementRecord(record)}
						>
							结算
						</Button>
					)}
					<Button
						type="link"
						danger={record.defaultStatus === "normal"}
						disabled={record.settlementStatus === "settled" || record.settlementStatus === "cancelled"}
						onClick={() => (record.defaultStatus === "default" ? void openDetail(record) : setDefaultRecord(record))}
					>
						{record.defaultStatus === "default" ? "违约详情" : "生成违约账单"}
					</Button>
				</Space>
			)
		}
	];

	// 渲染筛选、状态工具栏、账单列表和业务弹层。
	return (
		<section className="bill-management">
			{/* TablePro 统一生成账单搜索、工具栏、表格和分页 */}
			<TablePro<BillRecord, BillSearchValues>
				rowKey="id"
				columns={columns}
				dataSource={records}
				loading={loading}
				onSearch={applyFilters}
				onReset={resetFilters}
				headerLeft={
					<Space>
						<Radio.Group
							value={status}
							buttonStyle="solid"
							onChange={event => {
								setStatus(event.target.value);
								setPageNum(1);
							}}
						>
							{STATUS_OPTIONS.map(item => (
								<Radio.Button key={item.value} value={item.value}>
									{item.label}
								</Radio.Button>
							))}
						</Radio.Group>
						<Button type="primary" icon={<DownloadOutlined />} loading={working} onClick={() => void exportCurrent()}>
							导出
						</Button>
					</Space>
				}
				headerRight={
					<Button icon={<ReloadOutlined />} onClick={() => setRevision(value => value + 1)}>
						刷新
					</Button>
				}
				scroll={{ x: 2450 }}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showTotal: count => `共 ${count} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					}
				}}
			/>
			{/* 账单详情、结算确认和违约账单弹层 */}
			<BillDetail visible={!!detail} record={detail} loading={detailLoading} onClose={() => setDetail(undefined)} />
			<BillSettlementModal
				visible={!!settlementRecord}
				record={settlementRecord}
				confirming={working}
				onClose={() => setSettlementRecord(undefined)}
				onConfirm={values => void confirmSettlement(values)}
			/>
			<BillDefaultModal
				visible={!!defaultRecord}
				record={defaultRecord}
				confirming={working}
				onClose={() => setDefaultRecord(undefined)}
				onConfirm={values => void confirmDefaultBill(values)}
			/>
		</section>
	);
};

export default BillManagement;
