import { useCallback, useEffect, useState } from "react";
import { Button, Form, InputNumber, Radio, Space, Tag, message } from "antd";
import type { Moment } from "moment";
import { DeleteOutlined, DownloadOutlined, EditOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import type {
	ContractForm,
	ContractListParams,
	ContractPaymentMethod,
	ContractRecord,
	ContractValidStatus
} from "@/api/interface/contract";
import {
	cancelContract,
	downloadContractExport,
	downloadContractFile,
	editContract,
	exportContractList,
	getContractDetail,
	getContractList,
	remarkContract
} from "@/api/modules/contract";
import TablePro from "@/components/TablePro";
import type { TableProColumn } from "@/components/TablePro";
import ContractCancellation from "./components/ContractCancellation";
import ContractDetail from "./components/ContractDetail";
import ContractEditor from "./components/ContractEditor";
import ContractRemark from "./components/ContractRemark";
import "./index.less";

/** 合同 TablePro 搜索表单值，提交时再转换为接口参数。 */
interface ContractSearchValues {
	contractNo?: string;
	relename?: string;
	bankAccount?: string;
	cardid?: string;
	totalAmount?: string;
	termOfLease?: string;
	mobile?: string;
	beginActualNum?: number;
	endActualNum?: number;
	perAcreAmount?: string;
	paymentMethod?: ContractPaymentMethod;
	startTime?: Moment;
	endTime?: Moment;
	createTime?: [Moment, Moment];
	createName?: string;
}

/** 合同状态标签选项。 */
const STATUS_OPTIONS: Array<{ label: string; value: ContractValidStatus }> = [
	{ label: "待生效", value: "1" },
	{ label: "生效中", value: "2" },
	{ label: "已到期", value: "3" },
	{ label: "已作废", value: "4" }
];

/** 合同状态颜色与文案。 */
const STATUS_META = {
	"1": { color: "blue", text: "待生效" },
	"2": { color: "green", text: "生效中" },
	"3": { color: "default", text: "已到期" },
	"4": { color: "red", text: "已作废" }
} as const;

/** 付款方式展示文案。 */
const PAYMENT_METHOD_LABEL = { "1": "年付", "2": "两季付", "3": "三季付" } as const;

/** 触发浏览器下载并及时释放临时 URL。 */
const saveBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 地约合同管理页面，迁移筛选、列表及合同全生命周期操作。 */
const ContractManagement = () => {
	// 查询条件、状态标签和分页分别维护，保证翻页后保留筛选。
	const [filters, setFilters] = useState<ContractListParams>({});
	const [validStatus, setValidStatus] = useState<ContractValidStatus>("1");
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	// 保存合同列表及异步操作状态。
	const [records, setRecords] = useState<ContractRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// 保存详情、编辑、作废和备注弹层对应的合同。
	const [detail, setDetail] = useState<ContractRecord>();
	const [detailLoading, setDetailLoading] = useState(false);
	const [editor, setEditor] = useState<ContractRecord>();
	const [cancellation, setCancellation] = useState<ContractRecord>();
	const [remarkRecord, setRemarkRecord] = useState<ContractRecord>();

	/** 加载当前状态、筛选和分页对应的合同列表。 */
	const loadContracts = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getContractList({ ...filters, validStatus, pageNum, pageSize });
			if (!Array.isArray(response.data?.rows)) throw new Error("合同列表响应格式不正确");
			setRecords(response.data.rows);
			setTotal(response.data.total);
		} catch {
			setRecords([]);
			setTotal(0);
			message.error("合同列表加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [filters, pageNum, pageSize, validStatus]);

	useEffect(() => {
		// 筛选、状态、分页或写操作完成后刷新列表。
		void loadContracts();
	}, [loadContracts, revision]);

	/** 把日期范围字段转换为合同列表接口参数。 */
	const applyFilters = (values: ContractSearchValues) => {
		const { startTime, endTime, createTime, totalAmount, termOfLease, perAcreAmount, ...rest } = values;
		setFilters({
			...rest,
			totalAmount: totalAmount ? Number(totalAmount) : undefined,
			termOfLease: termOfLease ? Number(termOfLease) : undefined,
			perAcreAmount: perAcreAmount ? Number(perAcreAmount) : undefined,
			startTime: startTime?.format("YYYY-MM-DD"),
			endTime: endTime?.format("YYYY-MM-DD"),
			beginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			endsTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
		setPageNum(1);
	};

	/** 清空全部查询条件并回到第一页。 */
	const resetFilters = () => {
		setFilters({});
		setPageNum(1);
	};

	/** 关闭业务弹层并重新加载当前列表。 */
	const refresh = () => {
		setDetail(undefined);
		setEditor(undefined);
		setCancellation(undefined);
		setRemarkRecord(undefined);
		setRevision(value => value + 1);
	};

	/** 读取完整合同后打开详情或编辑弹窗。 */
	const openContract = async (record: ContractRecord, mode: "detail" | "edit") => {
		if (mode === "detail") {
			setDetail(record);
			setDetailLoading(true);
		} else setWorking(true);
		try {
			const response = await getContractDetail(record.id);
			if (!response.data) throw new Error("缺少合同详情");
			if (mode === "detail") setDetail(response.data);
			else setEditor(response.data);
		} catch {
			message.error("合同详情加载失败，请重试");
		} finally {
			setDetailLoading(false);
			setWorking(false);
		}
	};

	/** 保存合同编辑表单。 */
	const saveContract = async (values: ContractForm) => {
		setWorking(true);
		try {
			await editContract(values);
			message.success("合同修改成功");
			refresh();
		} catch {
			message.error("合同修改失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 保存合同备注。 */
	const saveRemark = async (remark: string) => {
		if (!remarkRecord) return;
		setWorking(true);
		try {
			await remarkContract(remarkRecord.id, remark);
			message.success("备注保存成功");
			refresh();
		} catch {
			message.error("备注保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 确认作废合同并刷新状态列表。 */
	const confirmCancellation = async (reason: string) => {
		if (!cancellation) return;
		setWorking(true);
		try {
			await cancelContract(cancellation.id, reason);
			message.success("合同已作废");
			refresh();
		} catch {
			message.error("合同作废失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 导出当前状态和筛选下的合同列表。 */
	const exportCurrent = async () => {
		setWorking(true);
		try {
			const response = await exportContractList({ ...filters, validStatus });
			if (!response.data) throw new Error("未生成导出文件");
			const blob = await downloadContractExport(response.data);
			saveBlob(blob, "合同列表.csv");
			message.success("合同列表导出成功");
		} catch {
			message.error("导出失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 下载单份 mock 合同文本。 */
	const downloadRecord = async (record: ContractRecord) => {
		try {
			const blob = await downloadContractFile(record);
			saveBlob(blob, `${record.contractNo}.txt`);
			message.success("合同下载成功");
		} catch {
			message.error("合同下载失败，请重试");
		}
	};

	// 由迁移后的 TablePro 列配置同时生成搜索区和合同表格。
	const columns: Array<TableProColumn<ContractRecord, ContractSearchValues>> = [
		{ title: "合同编号", dataIndex: "contractNo", width: 190, fixed: "left", search: { type: "input" } },
		{ title: "农户姓名", dataIndex: "relename", width: 110, search: { type: "input" } },
		{ title: "银行卡号", dataIndex: "bankAccount", width: 190, ellipsis: true, search: { type: "input" } },
		{ title: "身份证号", dataIndex: "cardid", width: 190, search: { type: "input" } },
		{
			title: "合同总金额（元）",
			dataIndex: "totalAmount",
			width: 150,
			search: { type: "input" },
			render: value => Number(value).toFixed(2)
		},
		{ title: "合同期限（年）", dataIndex: "termOfLease", width: 130, search: { type: "input" } },
		{ title: "手机号码", dataIndex: "mobile", width: 140, search: { type: "input" } },
		{
			title: "地块面积（亩）",
			dataIndex: "actualAcreNum",
			width: 130,
			search: {
				render: () => (
					<div className="contract-range">
						<Form.Item name="beginActualNum" noStyle>
							<InputNumber min={0} placeholder="请输入" />
						</Form.Item>
						<span>~</span>
						<Form.Item name="endActualNum" noStyle>
							<InputNumber min={0} placeholder="请输入" />
						</Form.Item>
					</div>
				)
			},
			render: value => Number(value).toFixed(2)
		},
		{
			title: "每亩租金（元）",
			dataIndex: "perAcreAmount",
			width: 140,
			search: { type: "input" },
			render: value => Number(value).toFixed(2)
		},
		{
			title: "付款方式",
			dataIndex: "paymentMethod",
			width: 110,
			search: { type: "select" },
			enum: [
				{ value: "1", label: "年付" },
				{ value: "2", label: "两季付" },
				{ value: "3", label: "三季付" }
			],
			render: value => PAYMENT_METHOD_LABEL[value as keyof typeof PAYMENT_METHOD_LABEL]
		},
		{ title: "年付/季付金额（元）", dataIndex: "paymentAmount", width: 170, render: value => Number(value).toFixed(2) },
		{ title: "地块位置", dataIndex: "detailaddress", width: 230, ellipsis: true },
		{ title: "合同开始时间", dataIndex: "startTime", width: 140, search: { type: "date-picker" } },
		{ title: "合同结束时间", dataIndex: "endTime", width: 140, search: { type: "date-picker" } },
		{ title: "备注", dataIndex: "remark", width: 160, ellipsis: true, render: value => value || "—" },
		{ title: "创建时间", dataIndex: "createTime", width: 180, search: { type: "date-range" } },
		{ title: "创建人", dataIndex: "createName", width: 110, search: { type: "input" } },
		{
			title: "状态",
			dataIndex: "validStatus",
			width: 100,
			fixed: "right",
			render: value => (
				<Tag color={STATUS_META[value as ContractValidStatus].color}>{STATUS_META[value as ContractValidStatus].text}</Tag>
			)
		},
		{
			title: "操作",
			key: "operation",
			width: 330,
			fixed: "right",
			render: (_value, record) => (
				<Space size={2}>
					<Button
						type="link"
						icon={<EditOutlined />}
						disabled={record.validStatus === "4"}
						onClick={() => void openContract(record, "edit")}
					>
						编辑
					</Button>
					<Button type="link" icon={<FileTextOutlined />} onClick={() => void openContract(record, "detail")}>
						详情
					</Button>
					<Button type="link" icon={<DownloadOutlined />} onClick={() => void downloadRecord(record)}>
						下载
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						disabled={record.validStatus === "4"}
						onClick={() => setCancellation(record)}
					>
						作废
					</Button>
					<Button type="link" onClick={() => setRemarkRecord(record)}>
						备注
					</Button>
				</Space>
			)
		}
	];

	// 渲染查询、状态切换、合同表格和业务弹窗。
	return (
		<section className="contract-management">
			{/* TablePro 统一生成合同搜索、工具栏、表格和分页 */}
			<TablePro<ContractRecord, ContractSearchValues>
				rowKey="id"
				columns={columns}
				dataSource={records}
				loading={loading}
				onSearch={applyFilters}
				onReset={resetFilters}
				headerLeft={
					<Space>
						<Radio.Group
							value={validStatus}
							buttonStyle="solid"
							onChange={event => {
								setValidStatus(event.target.value);
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
				scroll={{ x: 3000 }}
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
			{/* 详情、编辑、作废和备注弹层 */}
			<ContractDetail visible={!!detail} record={detail} loading={detailLoading} onClose={() => setDetail(undefined)} />
			<ContractEditor
				visible={!!editor}
				record={editor}
				saving={working}
				onClose={() => setEditor(undefined)}
				onSave={values => void saveContract(values)}
			/>
			<ContractCancellation
				visible={!!cancellation}
				record={cancellation}
				confirming={working}
				onClose={() => setCancellation(undefined)}
				onConfirm={reason => void confirmCancellation(reason)}
			/>
			<ContractRemark
				visible={!!remarkRecord}
				record={remarkRecord}
				saving={working}
				onClose={() => setRemarkRecord(undefined)}
				onSave={remark => void saveRemark(remark)}
			/>
		</section>
	);
};

export default ContractManagement;
