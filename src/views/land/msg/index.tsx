import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Checkbox, Dropdown, Empty, Input, Menu, Modal, Space, Spin, Statistic, Tabs, Tag, message } from "antd";
import {
	ArrowLeftOutlined,
	EnvironmentOutlined,
	FilterOutlined,
	LeftOutlined,
	MoreOutlined,
	ReloadOutlined,
	RightOutlined
} from "@ant-design/icons";
import { convex, featureCollection, point } from "@turf/turf";
import type { LandCensus, LandListParams, LandRecord, VillageRecord } from "@/api/interface/land";
import {
	deleteLand,
	downloadLandExport,
	exportLandList,
	getLandCensus,
	getLandDetail,
	getLandList,
	getVillageList,
	quitLand,
	regainLand,
	removeMergedLand
} from "@/api/modules/land";
import LandMap from "@/components/LandMap";
import type { LandMapHandle } from "@/components/LandMap";
import FilterDrawer from "./components/FilterDrawer";
import LandDetail from "./components/LandDetail";
import LandEditor from "./components/LandEditor";
import OperationModal from "./components/OperationModal";
import type { LandOperation } from "./components/OperationModal";
import RegionSelect from "./components/RegionSelect";
import "./index.less";

/** 源后端允许数值 ID；在 UI 边界统一为字符串。 */
const normalizeRecord = (record: LandRecord): LandRecord => ({
	...record,
	id: String(record.id),
	type: String(record.type || "2"),
	landType: String(record.landType || ""),
	actualAcreNum: Number(record.actualAcreNum || 0),
	gpsList: record.gpsList || [],
	landList: record.landList?.map(normalizeRecord)
});

/** 土地列表、地图、详情及业务操作页面。 */
const LandInformation = () => {
	// 已应用条件与搜索框草稿分开维护。
	const [filters, setFilters] = useState<LandListParams>({});
	const [keyword, setKeyword] = useState("");
	const [type, setType] = useState<"" | "1" | "2">("");
	const [quit, setQuit] = useState(false);
	// 接口结果及局部加载、异常状态。
	const [records, setRecords] = useState<LandRecord[]>([]);
	const [census, setCensus] = useState<LandCensus>();
	const [villages, setVillages] = useState<VillageRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);
	const [revision, setRevision] = useState(0);
	// 列表和地图的选择、聚焦与子块预览。
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [focusedId, setFocusedId] = useState<string>();
	const [childPreview, setChildPreview] = useState<LandRecord>();
	const [expandedId, setExpandedId] = useState<string>();
	const [batch, setBatch] = useState<"merge" | "transfer">();
	const batchRef = useRef(batch);
	batchRef.current = batch;
	// 界面折叠、详情、编辑及业务弹窗。
	const [collapsed, setCollapsed] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [detailId, setDetailId] = useState<string>();
	const [editor, setEditor] = useState<{ record: LandRecord; mode: "base" | "contract" }>();
	const [operation, setOperation] = useState<LandOperation>();
	const [working, setWorking] = useState(false);
	const mapRef = useRef<LandMapHandle>(null);
	const cardRefs = useRef(new Map<string, HTMLDivElement>());

	/** 写入成功后清理暂存操作并刷新列表和统计。 */
	const refresh = useCallback(() => {
		setSelectedIds([]);
		setFocusedId(undefined);
		setChildPreview(undefined);
		setExpandedId(undefined);
		setBatch(undefined);
		setOperation(undefined);
		setEditor(undefined);
		setDetailId(undefined);
		setRevision(value => value + 1);
	}, []);

	useEffect(() => {
		// 防止较早筛选请求覆盖当前查询结果。
		let active = true;
		setLoading(true);
		setFailed(false);
		setRecords([]);
		setCensus(undefined);
		setSelectedIds([]);
		setFocusedId(undefined);
		setChildPreview(undefined);
		setBatch(undefined);
		setExpandedId(undefined);
		Promise.all([
			getLandList({ ...filters, quitStatus: quit ? "1" : "0", type: quit ? "" : type }),
			getLandCensus({ quitStatus: quit ? "1" : "0" })
		])
			.then(([list, count]) => {
				if (!active) return;
				if (!Array.isArray(list.data?.rows)) throw new Error("土地列表响应格式不正确");
				setRecords(list.data.rows.map(normalizeRecord));
				setCensus(count.data);
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
	}, [filters, quit, type, revision]);

	useEffect(() => {
		// 行政村选项由筛选与编辑共用。
		let active = true;
		getVillageList()
			.then(response => {
				if (active) setVillages(response.data?.rows || []);
			})
			.catch(() => {
				/* 请求层提示错误，其他操作保持可用。 */
			});
		return () => {
			active = false;
		};
	}, []);

	/** 地图点击切换选择并滚动到对应卡片。 */
	const handleMapClick = useCallback((id: string) => {
		setChildPreview(undefined);
		setSelectedIds(current =>
			batchRef.current ? (current.includes(id) ? current.filter(value => value !== id) : [...current, id]) : [id]
		);
		cardRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, []);

	/** 列表点击与地图共用选中状态。 */
	const selectRecord = (record: LandRecord, child = false) => {
		if (child) {
			setChildPreview(record);
			setFocusedId(undefined);
			setSelectedIds([]);
			return;
		}
		setChildPreview(undefined);
		setSelectedIds(current =>
			batch ? (current.includes(record.id) ? current.filter(id => id !== record.id) : [...current, record.id]) : [record.id]
		);
		setFocusedId(record.id);
	};

	/** 编辑前读取完整详情。 */
	const openEditor = async (record: LandRecord) => {
		setWorking(true);
		try {
			const response = await getLandDetail(record.id);
			if (!response.data) throw new Error("缺少地块详情");
			setEditor({ record: normalizeRecord(response.data), mode: "base" });
		} catch {
			message.error("地块详情加载失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 对删除、退地、恢复和移出给出明确的二次确认。 */
	const confirmAction = (action: string, record: LandRecord, parent?: LandRecord) => {
		// 当前卡片才是实际操作对象。
		const title = action === "delete" ? "删除地块" : action === "quit" ? "退地" : action === "regain" ? "恢复地块" : "移出地块";
		Modal.confirm({
			title: title + " · " + record.landName,
			content:
				action === "delete"
					? "删除后地块信息和坐标无法恢复，是否继续？"
					: action === "remove"
					? "确定将该地块从合并地块中移出？"
					: "确定对该地块执行" + title + "？",
			okText: "确定",
			cancelText: "取消",
			okButtonProps: { danger: action === "delete" },
			onOk: async () => {
				if (action === "delete") await deleteLand([record.id]);
				if (action === "quit") await quitLand({ id: record.id });
				if (action === "regain") await regainLand({ id: record.id });
				if (action === "remove" && parent) await removeMergedLand({ id: parent.id, landOrList: [{ landId: record.id }] });
				message.success(title + "成功");
				refresh();
			}
		});
	};

	/** 单条操作独立于列表勾选状态。 */
	const handleAction = (action: string, record: LandRecord, parent?: LandRecord) => {
		if (action === "edit") {
			void openEditor(record);
			return;
		}
		if (action === "rename" || action === "transfer") {
			setOperation({ kind: action, records: [record] });
			return;
		}
		confirmAction(action, record, parent);
	};

	/** 校验选择并按源算法生成凸包合并预览。 */
	const confirmBatch = () => {
		const selected = records.filter(record => selectedIds.includes(record.id));
		if (!selected.length) return message.warning("请先选择地块");
		if (batch === "transfer") {
			setOperation({ kind: "transfer", records: selected });
			return;
		}
		if (selected.length < 2) return message.warning("请至少选择两个地块");
		if (selected.some(record => record.landType === "2" || record.landList?.some(child => child.landType === "2")))
			return message.warning("托管地块不允许合并");
		if (
			selected.some(
				record =>
					record.gpsList.length < 3 ||
					record.gpsList.some(gps => !Number.isFinite(Number(gps.lng)) || !Number.isFinite(Number(gps.lat)))
			)
		)
			return message.warning("所选地块缺少有效边界，无法合并");
		const polygon = convex(
			featureCollection(selected.flatMap(record => record.gpsList.map(gps => point([Number(gps.lng), Number(gps.lat)]))))
		);
		if (!polygon) return message.warning("所选边界无法形成合并地块");
		setOperation({
			kind: "merge",
			records: selected,
			preview: {
				ids: selected.map(record => record.id),
				area: Number(selected.reduce((sum, record) => sum + record.actualAcreNum, 0).toFixed(2)),
				coordinates: polygon.geometry.coordinates[0]
			}
		});
	};

	/** 按当前完整筛选条件导出土地列表。 */
	const exportCurrent = async () => {
		setWorking(true);
		try {
			const response = await exportLandList({ ...filters, quitStatus: quit ? "1" : "0", type: quit ? "" : type });
			if (!response.data) throw new Error("未获取到导出文件");
			const blob = await downloadLandExport(response.data);
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "地块列表.xlsx";
			link.click();
			window.setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch {
			message.error("导出失败，请稍后重试");
		} finally {
			setWorking(false);
		}
	};

	/** 父块和子块复用卡片布局，操作绑定当前记录。 */
	const renderRecord = (record: LandRecord, parent?: LandRecord) => {
		const active = selectedIds.includes(record.id) || childPreview?.id === record.id;
		const actions = quit
			? [
					{ key: "rename", label: "修改地块名称" },
					{ key: "regain", label: "恢复地块" },
					{ key: "delete", label: "删除地块", danger: true }
			  ]
			: record.type === "1" && !parent
			? [
					{ key: "rename", label: "修改地块名称" },
					{ key: "transfer", label: "转移地块" }
			  ]
			: [
					{ key: "edit", label: "修改地块信息" },
					...(parent ? [{ key: "remove", label: "移出地块" }] : []),
					{ key: "quit", label: "退地" },
					{ key: "delete", label: "删除地块", danger: true }
			  ];
		// 卡片主选择区与菜单、详情按钮分别响应点击。
		return (
			<div
				key={record.id}
				ref={element => {
					if (!parent) {
						if (element) cardRefs.current.set(record.id, element);
						else cardRefs.current.delete(record.id);
					}
				}}
				className={"land-record" + (active ? " is-active" : "") + (parent ? " is-child" : "")}
			>
				<div className="land-record-main">
					{batch && !parent && (
						<Checkbox
							checked={selectedIds.includes(record.id)}
							onChange={() => selectRecord(record)}
							aria-label={"选择" + record.landName}
						/>
					)}
					<button className="land-record-select" onClick={() => selectRecord(record, !!parent)}>
						<span className="land-record-image">
							{record.url ? (
								<img
									src={record.url}
									alt=""
									onError={event => {
										event.currentTarget.style.display = "none";
									}}
								/>
							) : (
								<EnvironmentOutlined />
							)}
						</span>
						<span className="land-record-text">
							<strong>
								{record.landName || "未命名地块"} <em>{record.actualAcreNum.toFixed(2)} 亩</em>
							</strong>
							<span>
								{quit ? "操作人" : "上传人"}：{record.createName || parent?.createName || "未知"} ·{" "}
								{record.createMobile || parent?.createMobile || "未知"}
							</span>
							<span>
								{quit ? "退地时间" : "创建时间"}：{record.createTime || "未知"}
							</span>
						</span>
					</button>
					<Dropdown
						trigger={["click"]}
						overlay={<Menu items={actions} onClick={({ key }) => handleAction(key, record, parent)} />}
					>
						<Button type="text" icon={<MoreOutlined />} aria-label={record.landName + "的操作"} disabled={working || !!batch} />
					</Dropdown>
				</div>
				<div className="land-record-footer">
					<span>
						<Tag color={record.landType === "1" ? "green" : "cyan"}>
							{record.landType === "1" ? "流转" : record.landType === "2" ? "托管" : "合并地块"}
							{quit ? " · 已退地" : ""}
						</Tag>
						{!!record.landList?.length && (
							<Button
								type="link"
								size="small"
								onClick={() => setExpandedId(expandedId === record.id ? undefined : record.id)}
								disabled={!!batch}
							>
								共 {record.landList.length} 个地块 {expandedId === record.id ? "收起" : "展开"}
							</Button>
						)}
					</span>
					<Button size="small" type="link" onClick={() => setDetailId(record.id)}>
						地块详情
					</Button>
				</div>
			</div>
		);
	};

	// 已选地块及面积的派生统计。
	const selected = records.filter(record => selectedIds.includes(record.id));
	const selectedArea = selected.reduce((sum, record) => sum + record.actualAcreNum, 0);
	// 顶部菜单进入批量选择、退地列表或导出。
	const topMenu = (
		<Menu
			items={[
				{ key: "merge", label: "合并地块" },
				{ key: "transfer", label: "转移地块" },
				{ key: "quit", label: "显示退地地块" },
				{ key: "export", label: "导出" }
			]}
			onClick={({ key }) => {
				if (key === "quit") {
					setQuit(true);
					setKeyword("");
					setFilters({});
				} else if (key === "export") {
					void exportCurrent();
				} else {
					setBatch(key as "merge" | "transfer");
					setSelectedIds([]);
					setChildPreview(undefined);
				}
			}}
		/>
	);
	// 土地查询列表与 GIS 地图双栏布局。
	return (
		<section className={"land-information" + (collapsed ? " is-collapsed" : "")}>
			{/* 查询、统计与地块列表 */}
			<aside className="land-sidebar">
				<div className="land-search-row">
					{quit && (
						<Button
							icon={<ArrowLeftOutlined />}
							aria-label="返回全部地块"
							onClick={() => {
								setQuit(false);
								setFilters({});
								setKeyword("");
							}}
						/>
					)}
					<Input.Search
						value={keyword}
						placeholder="输入关键字搜索"
						allowClear
						onChange={event => setKeyword(event.target.value)}
						onSearch={value => setFilters(current => ({ ...current, searchValue: value.trim() }))}
					/>
					<Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)} aria-label="筛选地块" />
					{!quit && (
						<Dropdown overlay={topMenu} trigger={["click"]}>
							<Button icon={<MoreOutlined />} aria-label="更多土地操作" disabled={loading || working} />
						</Dropdown>
					)}
				</div>
				<div className="land-statistics">
					<Statistic title={quit ? "退地总面积（亩）" : "总面积（亩）"} value={census?.acreageCount ?? "—"} precision={2} />
					<Statistic title={quit ? "退地总数（个）" : "地块总数（个）"} value={census?.landNum ?? "—"} />
					<Statistic title="行政村（个）" value={census?.administrativeVillageCount ?? "—"} />
				</div>
				<div className="land-region-row">
					<EnvironmentOutlined />
					<RegionSelect
						value={[filters.province, filters.city, filters.district, filters.township].filter(Boolean) as string[]}
						onChange={region =>
							setFilters(current => ({
								...current,
								province: region[0],
								city: region[1],
								district: region[2],
								township: region[3]
							}))
						}
					/>
					<Button icon={<ReloadOutlined />} onClick={refresh} aria-label="刷新地块" disabled={loading} />
				</div>
				{quit ? (
					<h3 className="land-quit-title">退地地块</h3>
				) : (
					<Tabs activeKey={type} onChange={value => setType(value as typeof type)} centered>
						<Tabs.TabPane tab="全部地块" key="" />
						<Tabs.TabPane tab="合并地块" key="1" />
						<Tabs.TabPane tab="单个地块" key="2" />
					</Tabs>
				)}
				<div className="land-record-list">
					<Spin spinning={loading}>
						{failed ? (
							<Alert
								type="error"
								showIcon
								message="土地数据加载失败"
								description="请检查服务连接后重试。"
								action={<Button onClick={refresh}>重试</Button>}
							/>
						) : !records.length && !loading ? (
							<Empty description="暂无符合条件的地块" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						) : (
							records.map(record => (
								<div key={record.id}>
									{renderRecord(record)}
									{expandedId === record.id && record.landList?.map(child => renderRecord(child, record))}
								</div>
							))
						)}
					</Spin>
				</div>
				{/* 批量选择与操作确认 */}
				{batch && (
					<div className="land-batch-bar">
						<div>
							<Checkbox
								checked={!!records.length && selected.length === records.length}
								indeterminate={!!selected.length && selected.length < records.length}
								onChange={event => setSelectedIds(event.target.checked ? records.map(record => record.id) : [])}
							>
								全选
							</Checkbox>
							<p>
								已选 {selected.length} 个，共 {selectedArea.toFixed(2)} 亩
							</p>
						</div>
						<Space>
							<Button
								onClick={() => {
									setBatch(undefined);
									setSelectedIds([]);
								}}
							>
								取消
							</Button>
							<Button type="primary" onClick={confirmBatch} disabled={!selected.length}>
								{batch === "merge" ? "合并" : "转移"}
							</Button>
						</Space>
					</div>
				)}
			</aside>
			{/* 地图与折叠控件 */}
			<Button
				className="land-collapse"
				icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
				onClick={() => setCollapsed(value => !value)}
				aria-label={collapsed ? "展开地块列表" : "收起地块列表"}
			/>
			<div className="land-map-area">
				<LandMap
					ref={mapRef}
					records={records}
					selectedIds={selectedIds}
					focusedId={focusedId}
					childPreview={childPreview}
					mergePreview={operation?.preview}
					onLandClick={handleMapClick}
				/>
			</div>
			{/* 筛选、详情、编辑及业务操作弹层 */}
			{filterOpen && (
				<FilterDrawer
					value={filters}
					villages={villages}
					onClose={() => setFilterOpen(false)}
					onApply={value => {
						setFilters(current => ({ ...value, searchValue: current.searchValue }));
						setFilterOpen(false);
					}}
				/>
			)}
			{detailId && (
				<LandDetail
					id={detailId}
					readOnly={quit}
					onClose={() => setDetailId(undefined)}
					onEdit={(record, mode) => setEditor({ record, mode })}
				/>
			)}
			{editor && (
				<LandEditor
					record={editor.record}
					mode={editor.mode}
					villages={villages}
					onClose={() => setEditor(undefined)}
					onSaved={refresh}
				/>
			)}
			{operation && (
				<OperationModal operation={operation} map={mapRef.current} onClose={() => setOperation(undefined)} onSaved={refresh} />
			)}
		</section>
	);
};

export default LandInformation;
