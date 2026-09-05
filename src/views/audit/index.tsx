import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Checkbox, Dropdown, Empty, Input, Menu, Modal, Space, Spin, Tabs, Tag, message } from "antd";
import {
	EnvironmentOutlined,
	FilterOutlined,
	LeftOutlined,
	MoreOutlined,
	ReloadOutlined,
	RightOutlined,
	WarningOutlined
} from "@ant-design/icons";
import type { AuditCensus, AuditForm, AuditListParams, AuditRecord, AuditStatus, AuditSummary } from "@/api/interface/audit";
import type { VillageRecord } from "@/api/interface/land";
import {
	deleteAudit,
	getAuditCensus,
	getAuditDetail,
	getAuditList,
	getAuditSummary,
	quitAudit,
	recoverAudit,
	saveAudit
} from "@/api/modules/audit";
import { getVillageList } from "@/api/modules/land";
import AuditDetailDrawer from "./components/AuditDetailDrawer";
import AuditEditor from "./components/AuditEditor";
import AuditFilterDrawer from "./components/AuditFilterDrawer";
import AuditMap from "./components/AuditMap";
import "./index.less";

/** 审核页状态标签定义。 */
const STATUS_TABS: Array<{ key: AuditStatus; label: string; countKey: keyof AuditCensus }> = [
	{ key: "", label: "全部", countKey: "allNum" },
	{ key: "0", label: "待审核", countKey: "unauditedNum" },
	{ key: "1", label: "已审核", countKey: "auditedNum" },
	{ key: "2", label: "已退地", countKey: "quitLandNum" }
];

/** 把接口边界可能出现的数值字段统一为页面所需类型。 */
const normalizeRecord = (record: AuditRecord): AuditRecord => ({
	...record,
	id: String(record.id),
	status: String(record.status) as AuditRecord["status"],
	landType: String(record.landType) as AuditRecord["landType"],
	actualAcreNum: Number(record.actualAcreNum || 0),
	acreageNum: Number(record.acreageNum || 0),
	gpsList: record.gpsList || []
});

/** 地约审核管理页面，包含列表、地图、详情和合同审核流程。 */
const AuditManagement = () => {
	// 查询关键词、高级条件和当前状态标签。
	const [keyword, setKeyword] = useState("");
	const [filters, setFilters] = useState<AuditListParams>({});
	const [status, setStatus] = useState<AuditStatus>("");
	// 保存列表、统计与异步状态。
	const [records, setRecords] = useState<AuditRecord[]>([]);
	const [census, setCensus] = useState<AuditCensus>();
	const [summary, setSummary] = useState<AuditSummary>();
	const [villages, setVillages] = useState<VillageRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// 维护地图与列表共用的选择和聚焦状态。
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [focusedId, setFocusedId] = useState<string>();
	const [batchAction, setBatchAction] = useState<"quit" | "recover" | "delete">();
	const batchActionRef = useRef(batchAction);
	batchActionRef.current = batchAction;
	const cardRefs = useRef(new Map<string, HTMLDivElement>());
	// 管理折叠、高级筛选、详情和审核弹层。
	const [collapsed, setCollapsed] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [detail, setDetail] = useState<AuditRecord>();
	const [detailLoading, setDetailLoading] = useState(false);
	const [editor, setEditor] = useState<AuditRecord>();

	/** 清理操作态并触发列表、统计重新加载。 */
	const refresh = useCallback(() => {
		setSelectedIds([]);
		setFocusedId(undefined);
		setBatchAction(undefined);
		setDetail(undefined);
		setEditor(undefined);
		setRevision(value => value + 1);
	}, []);

	useEffect(() => {
		// 筛选、状态或业务数据变化后并行读取列表和两类统计。
		let active = true;
		const params = { ...filters, status };
		setLoading(true);
		setFailed(false);
		Promise.all([getAuditList(params), getAuditCensus(), getAuditSummary(params)])
			.then(([listResponse, censusResponse, summaryResponse]) => {
				if (!active) return;
				if (!Array.isArray(listResponse.data?.rows)) throw new Error("审核列表响应格式不正确");
				setRecords(listResponse.data.rows.map(normalizeRecord));
				setCensus(censusResponse.data);
				setSummary(summaryResponse.data);
				setSelectedIds([]);
				setFocusedId(undefined);
			})
			.catch(() => {
				if (active) setFailed(true);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [filters, revision, status]);

	useEffect(() => {
		// 行政村选项供高级筛选和审核表单共用。
		let active = true;
		getVillageList()
			.then(response => {
				if (active) setVillages(response.data?.rows || []);
			})
			.catch(() => {
				/* 行政村加载失败不阻断审核列表。 */
			});
		return () => {
			active = false;
		};
	}, []);

	/** 地图点击时按单选或批量模式更新列表选择并滚动定位。 */
	const handleMapClick = useCallback((id: string) => {
		setSelectedIds(current =>
			batchActionRef.current ? (current.includes(id) ? current.filter(value => value !== id) : [...current, id]) : [id]
		);
		setFocusedId(id);
		cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, []);

	/** 列表卡片点击时同步地图选中与聚焦状态。 */
	const selectRecord = (record: AuditRecord) => {
		setSelectedIds(current =>
			batchAction ? (current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id]) : [record.id]
		);
		setFocusedId(record.id);
	};

	/** 读取完整地块数据后打开详情抽屉。 */
	const openDetail = async (record: AuditRecord) => {
		setDetail(record);
		setDetailLoading(true);
		try {
			const response = await getAuditDetail(record.id);
			if (response.data) setDetail(normalizeRecord(response.data));
		} catch {
			message.error("地块详情加载失败，请重试");
		} finally {
			setDetailLoading(false);
		}
	};

	/** 读取完整地块数据后打开审核或编辑合同弹窗。 */
	const openEditor = async (record: AuditRecord) => {
		setWorking(true);
		try {
			const response = await getAuditDetail(record.id);
			if (!response.data) throw new Error("缺少审核详情");
			setDetail(undefined);
			setEditor(normalizeRecord(response.data));
		} catch {
			message.error("审核信息加载失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 提交合同审核并刷新状态统计。 */
	const submitAudit = async (values: AuditForm) => {
		setWorking(true);
		try {
			await saveAudit(values);
			message.success(editor?.status === "1" ? "审核信息修改成功" : "审核完成");
			refresh();
		} catch {
			message.error("审核信息保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 弹出确认框执行退地、恢复或删除操作。 */
	const confirmAction = (action: "quit" | "recover" | "delete", ids: string[], description: string) => {
		const actionText = action === "quit" ? "退地" : action === "recover" ? "恢复" : "删除";
		Modal.confirm({
			title: `${actionText}地块`,
			content: action === "delete" ? `${description} 删除后地块信息和坐标无法恢复，是否继续？` : description,
			okText: actionText,
			cancelText: "取消",
			okButtonProps: { danger: action === "delete" },
			onOk: async () => {
				if (action === "quit") await quitAudit(ids);
				if (action === "recover") await recoverAudit(ids);
				if (action === "delete") await deleteAudit(ids);
				message.success(`${actionText}成功`);
				refresh();
			}
		});
	};

	/** 确认当前批量操作并校验所选地块状态。 */
	const confirmBatch = () => {
		if (!batchAction || !selectedIds.length) return;
		const selected = records.filter(record => selectedIds.includes(record.id));
		if (batchAction === "recover" && selected.some(record => record.status !== "2"))
			return message.warning("恢复操作只能选择已退地块");
		if (batchAction === "quit" && selected.some(record => record.status === "2"))
			return message.warning("所选地块中包含已退地块");
		confirmAction(batchAction, selectedIds, `确定对所选 ${selectedIds.length} 个地块执行该操作吗？`);
	};

	/** 根据地块状态生成单条操作菜单。 */
	const createRecordMenu = (record: AuditRecord) => {
		const items =
			record.status === "2"
				? [
						{ key: "recover", label: "恢复" },
						{ key: "delete", label: "删除", danger: true }
				  ]
				: [
						{ key: "edit", label: record.status === "0" ? "审核信息" : "编辑" },
						{ key: "quit", label: "退地" },
						{ key: "delete", label: "删除", danger: true }
				  ];
		return (
			<Menu
				items={items}
				onClick={({ key }) => {
					if (key === "edit") void openEditor(record);
					else confirmAction(key as "quit" | "recover" | "delete", [record.id], `确定对“${record.landName}”执行该操作吗？`);
				}}
			/>
		);
	};

	// 派生当前批量选择数量与面积。
	const selectedRecords = records.filter(record => selectedIds.includes(record.id));
	const selectedArea = selectedRecords.reduce((total, record) => total + record.actualAcreNum, 0);
	// 构造源页面右上角的批量操作菜单。
	const batchMenu = (
		<Menu
			items={[
				{ key: "quit", label: "退地块" },
				{ key: "recover", label: "恢复地块" },
				{ key: "delete", label: "删除", danger: true }
			]}
			onClick={({ key }) => {
				setBatchAction(key as "quit" | "recover" | "delete");
				setSelectedIds([]);
			}}
		/>
	);

	// 渲染审核列表与 GIS 地图双栏页面。
	return (
		<section className={`audit-management${collapsed ? " is-collapsed" : ""}`}>
			{/* 搜索、状态统计和审核地块列表 */}
			<aside className="audit-sidebar">
				<div className="audit-search-row">
					<Input.Search
						value={keyword}
						allowClear
						placeholder="请输入关键字搜索"
						onChange={event => setKeyword(event.target.value)}
						onSearch={value => setFilters(current => ({ ...current, searchValue: value.trim() }))}
					/>
					<Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
						筛选
					</Button>
					<Dropdown overlay={batchMenu} trigger={["click"]}>
						<Button icon={<MoreOutlined />} aria-label="批量操作" />
					</Dropdown>
				</div>
				<Tabs activeKey={status} onChange={value => setStatus(value as AuditStatus)} centered className="audit-status-tabs">
					{STATUS_TABS.map(tab => (
						<Tabs.TabPane tab={`${tab.label} (${census?.[tab.countKey] ?? 0})`} key={tab.key} />
					))}
				</Tabs>
				<div className="audit-record-list">
					<Spin spinning={loading}>
						{failed ? (
							<Alert type="error" showIcon message="审核数据加载失败" action={<Button onClick={refresh}>重试</Button>} />
						) : !records.length && !loading ? (
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无符合条件的审核地块" />
						) : (
							records.map(record => {
								const active = selectedIds.includes(record.id);
								return (
									<div
										key={record.id}
										ref={element => {
											if (element) cardRefs.current.set(record.id, element);
											else cardRefs.current.delete(record.id);
										}}
										className={`audit-record${active ? " is-active" : ""}`}
									>
										{/* 卡片选择、缩略图与基本信息 */}
										<div className="audit-record-main">
											{batchAction && (
												<Checkbox checked={active} onChange={() => selectRecord(record)} aria-label={`选择${record.landName}`} />
											)}
											<button className="audit-record-select" onClick={() => selectRecord(record)}>
												<span className="audit-record-image">
													{record.url ? <img src={record.url} alt="" /> : <EnvironmentOutlined />}
												</span>
												<span className="audit-record-text">
													<strong>
														{record.landName}
														<em>{record.actualAcreNum.toFixed(2)} 亩</em>
													</strong>
													<span>
														上传人：{record.createName || "未知"} · {record.createMobile || "未知"}
													</span>
													<span>创建时间：{record.createTime || "未知"}</span>
												</span>
											</button>
											<Dropdown overlay={createRecordMenu(record)} trigger={["click"]}>
												<Button
													type="text"
													icon={<MoreOutlined />}
													disabled={!!batchAction || working}
													aria-label={`${record.landName}操作`}
												/>
											</Dropdown>
										</div>
										{/* 卡片状态、详情和校验提示 */}
										<div className="audit-record-footer">
											<Space>
												<Tag color={record.landType === "1" ? "green" : "cyan"}>
													{record.landType === "1" ? "流转中" : "托管中"}
												</Tag>
												<Tag color={record.status === "0" ? "orange" : record.status === "1" ? "green" : "default"}>
													{record.status === "0" ? "待审核" : record.status === "1" ? "已审核" : "已退地"}
												</Tag>
											</Space>
											<Button type="link" size="small" onClick={() => void openDetail(record)}>
												地块详情
											</Button>
										</div>
										{record.status === "0" && (
											<button className="audit-review-link" onClick={() => void openEditor(record)}>
												审核信息
											</button>
										)}
										{record.bankMetaStatus === "0" && (
											<div className="audit-bank-warning">
												<WarningOutlined />
												{record.bankMetaMessage}
											</div>
										)}
									</div>
								);
							})
						)}
					</Spin>
				</div>
				{/* 当前筛选结果总计 */}
				<div className="audit-summary">
					<span>{summary?.landNum ?? 0}</span> 个地块，共计：<span>{summary?.totalAcreageNum ?? 0}</span> 亩
					<Button type="text" icon={<ReloadOutlined />} onClick={refresh} aria-label="刷新审核列表" />
				</div>
				{/* 批量选择确认栏 */}
				{batchAction && (
					<div className="audit-batch-bar">
						<div>
							<Checkbox
								checked={!!records.length && selectedIds.length === records.length}
								indeterminate={!!selectedIds.length && selectedIds.length < records.length}
								onChange={event => setSelectedIds(event.target.checked ? records.map(record => record.id) : [])}
							>
								全选
							</Checkbox>
							<p>
								已选 {selectedIds.length} 个，共 {selectedArea.toFixed(2)} 亩
							</p>
						</div>
						<Space>
							<Button
								onClick={() => {
									setBatchAction(undefined);
									setSelectedIds([]);
								}}
							>
								取消
							</Button>
							<Button type="primary" disabled={!selectedIds.length} onClick={confirmBatch}>
								确定
							</Button>
						</Space>
					</div>
				)}
			</aside>
			{/* 地图与列表折叠控制 */}
			<Button
				className="audit-collapse"
				icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
				onClick={() => setCollapsed(value => !value)}
				aria-label={collapsed ? "展开审核列表" : "收起审核列表"}
			/>
			<div className="audit-map-area">
				<AuditMap records={records} selectedIds={selectedIds} focusedId={focusedId} onLandClick={handleMapClick} />
			</div>
			{/* 高级筛选、详情与合同审核弹层 */}
			<AuditFilterDrawer
				visible={filterOpen}
				value={filters}
				villages={villages}
				onClose={() => setFilterOpen(false)}
				onApply={value => {
					setFilters(current => ({ ...value, searchValue: current.searchValue }));
					setFilterOpen(false);
				}}
			/>
			<AuditDetailDrawer
				visible={!!detail}
				record={detail}
				loading={detailLoading}
				onClose={() => setDetail(undefined)}
				onEdit={record => void openEditor(record)}
				onAction={(action, record) => {
					setDetail(undefined);
					confirmAction(action, [record.id], `确定对“${record.landName}”执行该操作吗？`);
				}}
			/>
			<AuditEditor
				visible={!!editor}
				record={editor}
				villages={villages}
				saving={working}
				onClose={() => setEditor(undefined)}
				onSave={values => void submitAudit(values)}
			/>
		</section>
	);
};

export default AuditManagement;
