import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Popover, Progress, Space, Spin, Tabs, Tag, Tooltip, message } from "antd";
import {
	CheckSquareOutlined,
	ClearOutlined,
	DownloadOutlined,
	EditOutlined,
	EyeOutlined,
	FilterOutlined,
	LeftOutlined,
	MoreOutlined,
	PlusOutlined,
	ReloadOutlined,
	RightOutlined,
	SelectOutlined,
	UndoOutlined
} from "@ant-design/icons";
import type {
	FarmAreaCount,
	FarmAssignmentForm,
	FarmFormOptions,
	FarmMapLand,
	FarmStatusCount,
	FarmTaskForm,
	FarmTaskListParams,
	FarmTaskRecord,
	FarmTrajectory,
	FarmWorkStatus
} from "@/api/interface/farmMap";
import {
	addFarmTask,
	assignFarmTask,
	downloadFarmTaskExport,
	editFarmTask,
	exportFarmTaskList,
	getFarmAreaCount,
	getFarmFormOptions,
	getFarmLands,
	getFarmStatusCount,
	getFarmTaskDetail,
	getFarmTaskList,
	getFarmTrajectories
} from "@/api/modules/farmMap";
import FarmDetailDrawer from "./components/FarmDetailDrawer";
import FarmEditorDrawer from "./components/FarmEditorDrawer";
import type { FarmLandSelectorRequest } from "./components/FarmEditorDrawer";
import FarmFilterDrawer from "./components/FarmFilterDrawer";
import FarmLandSelector from "./components/FarmLandSelector";
import type { FarmLandSelectorMode } from "./components/FarmLandSelector";
import FarmMapCanvas from "./components/FarmMapCanvas";
import "./index.less";

/** 农事编辑器下拉选项初始值。 */
const EMPTY_OPTIONS: FarmFormOptions = { crops: [], farmingTypes: [], standards: [], managers: [] };

/** 农事面积统计初始值。 */
const EMPTY_AREA_COUNT: FarmAreaCount = { countTotalArea: 0, countWorkArea: 0, countFinishNum: 0 };

/** 农事状态统计初始值。 */
const EMPTY_STATUS_COUNT: FarmStatusCount = { allCount: 0, workingCount: 0, finishedCount: 0 };

/** 浏览器保存 Blob 并及时释放临时地址。 */
const saveBlob = (blob: Blob, fileName: string) => {
	// 创建当前导出文件的临时资源地址。
	const url = URL.createObjectURL(blob);
	// 构造无需插入页面的下载链接。
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 农事地图页面，联动任务列表、地块、轨迹和业务抽屉。 */
const FarmMap = () => {
	// 保存任务查询条件、状态页签和列表数据。
	const [keyword, setKeyword] = useState("");
	const [filters, setFilters] = useState<FarmTaskListParams>({});
	const [workStatus, setWorkStatus] = useState<"" | FarmWorkStatus>("");
	const [tasks, setTasks] = useState<FarmTaskRecord[]>([]);
	const [areaCount, setAreaCount] = useState<FarmAreaCount>(EMPTY_AREA_COUNT);
	const [statusCount, setStatusCount] = useState<FarmStatusCount>(EMPTY_STATUS_COUNT);
	// 保存当前任务、展开卡片和地图聚焦地块。
	const [selectedTaskId, setSelectedTaskId] = useState("");
	const [expandedTaskId, setExpandedTaskId] = useState("");
	const [focusedLandId, setFocusedLandId] = useState<string>();
	const [trajectories, setTrajectories] = useState<FarmTrajectory[]>([]);
	// 保存侧栏和通用异步状态。
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [working, setWorking] = useState(false);
	const [revision, setRevision] = useState(0);
	// 保存筛选、详情和编辑弹层状态。
	const [filterVisible, setFilterVisible] = useState(false);
	const [detailRecord, setDetailRecord] = useState<FarmTaskRecord>();
	const [detailLoading, setDetailLoading] = useState(false);
	const [editorVisible, setEditorVisible] = useState(false);
	const [editorRecord, setEditorRecord] = useState<FarmTaskRecord>();
	const [editorLandIds, setEditorLandIds] = useState<string[]>([]);
	const [formOptions, setFormOptions] = useState<FarmFormOptions>(EMPTY_OPTIONS);
	// 保存地图选地和分配业务状态。
	const [selectorMode, setSelectorMode] = useState<FarmLandSelectorMode>();
	const [availableLands, setAvailableLands] = useState<FarmMapLand[]>([]);
	const [selectorSelectedIds, setSelectorSelectedIds] = useState<string[]>([]);
	const [selectionHistory, setSelectionHistory] = useState<string[][]>([]);
	const [rectangleSelecting, setRectangleSelecting] = useState(false);
	const [assignmentRecord, setAssignmentRecord] = useState<FarmTaskRecord>();
	const [assignMobile, setAssignMobile] = useState("");
	const [selectorLoading, setSelectorLoading] = useState(false);

	// 当前列表选中的农事任务。
	const selectedTask = useMemo(() => tasks.find(task => task.farmingId === selectedTaskId), [selectedTaskId, tasks]);
	// 编辑器当前已选择的完整地块数据。
	const editorSelectedLands = useMemo(
		() => availableLands.filter(land => editorLandIds.includes(land.id)),
		[availableLands, editorLandIds]
	);
	// 选地时地图展示全部可选地块，普通模式只展示当前任务地块。
	const mapLands = selectorMode ? availableLands : selectedTask?.lands || [];
	// 选地时高亮全部选中地块，普通模式只高亮列表当前地块。
	const mapSelectedIds = selectorMode ? selectorSelectedIds : focusedLandId ? [focusedLandId] : [];

	/** 加载筛选结果、状态数量和面积统计。 */
	const loadTasks = useCallback(async () => {
		setLoading(true);
		try {
			// 当前状态页签和筛选项共同构成请求参数。
			const params = { ...filters, workStatus };
			const [listResponse, areaResponse, statusResponse] = await Promise.all([
				getFarmTaskList(params),
				getFarmAreaCount(params),
				getFarmStatusCount(filters)
			]);
			if (!Array.isArray(listResponse.data?.rows)) throw new Error("农事列表响应格式不正确");
			// 保存列表和两个统计区域数据。
			const rows = listResponse.data.rows;
			setTasks(rows);
			setAreaCount(areaResponse.data || EMPTY_AREA_COUNT);
			setStatusCount(statusResponse.data || EMPTY_STATUS_COUNT);
			setSelectedTaskId(current => (rows.some(task => task.farmingId === current) ? current : rows[0]?.farmingId || ""));
		} catch {
			setTasks([]);
			setAreaCount(EMPTY_AREA_COUNT);
			setStatusCount(EMPTY_STATUS_COUNT);
			message.error("农事任务加载失败，请重试");
		} finally {
			setLoading(false);
		}
	}, [filters, workStatus]);

	useEffect(() => {
		// 筛选、状态或写操作变化后重新加载农事数据。
		void loadTasks();
	}, [loadTasks, revision]);

	useEffect(() => {
		// 页面首次进入时读取编辑器基础选项。
		getFarmFormOptions()
			.then(response => setFormOptions(response.data || EMPTY_OPTIONS))
			.catch(() => message.error("农事基础数据加载失败"));
	}, []);

	useEffect(() => {
		// 切换任务时加载对应作业轨迹，空选择则清理轨迹。
		if (!selectedTaskId) {
			setTrajectories([]);
			return;
		}
		let active = true;
		getFarmTrajectories(selectedTaskId)
			.then(response => {
				if (active) setTrajectories(response.data || []);
			})
			.catch(() => {
				if (active) setTrajectories([]);
			});
		return () => {
			active = false;
		};
	}, [selectedTaskId]);

	/** 更新关键字并触发列表查询。 */
	const searchTasks = (value: string) => {
		setKeyword(value);
		setFilters(current => ({ ...current, searchValue: value || undefined }));
	};

	/** 应用高级筛选并保留当前关键字。 */
	const applyAdvancedFilters = (values: FarmTaskListParams) => {
		setFilters({ ...values, searchValue: keyword || undefined });
		setWorkStatus(values.workStatus || workStatus);
		setFilterVisible(false);
	};

	/** 打开新增或编辑农事抽屉。 */
	const openEditor = (record?: FarmTaskRecord) => {
		setEditorRecord(record);
		setEditorLandIds(record?.lands.map(land => land.id) || []);
		// 编辑器需要完整地块列表来计算已选摘要。
		setAvailableLands(current => {
			const map = new Map(current.map(land => [land.id, land]));
			record?.lands.forEach(land => map.set(land.id, land));
			return [...map.values()];
		});
		setEditorVisible(true);
	};

	/** 查询完整任务并打开详情抽屉。 */
	const openDetail = async (record: FarmTaskRecord) => {
		setDetailRecord(record);
		setDetailLoading(true);
		try {
			const response = await getFarmTaskDetail(record.farmingId);
			if (!response.data) throw new Error("缺少农事详情");
			setDetailRecord(response.data);
		} catch {
			message.error("农事详情加载失败，请重试");
		} finally {
			setDetailLoading(false);
		}
	};

	/** 保存新增或编辑农事信息。 */
	const saveTask = async (values: FarmTaskForm) => {
		setWorking(true);
		try {
			await (values.farmingId ? editFarmTask(values) : addFarmTask(values));
			message.success(values.farmingId ? "农事修改成功" : "农事新增成功");
			setEditorVisible(false);
			setEditorRecord(undefined);
			setRevision(value => value + 1);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "农事保存失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 打开编辑器的地图选地流程。 */
	const openEditorLandSelector = async (request: FarmLandSelectorRequest) => {
		setSelectorLoading(true);
		setSelectorMode("editor");
		setSelectorSelectedIds(editorLandIds);
		setSelectionHistory([]);
		setRectangleSelecting(false);
		try {
			const response = await getFarmLands(request);
			setAvailableLands(response.data || []);
		} catch {
			message.error("可选地块加载失败，请重试");
		} finally {
			setSelectorLoading(false);
		}
	};

	/** 打开任务地块分配流程。 */
	const openAssignment = async (record: FarmTaskRecord) => {
		setAssignmentRecord(record);
		setAssignMobile(record.teamMobile);
		setSelectorSelectedIds(record.lands.map(land => land.id));
		setSelectionHistory([]);
		setRectangleSelecting(false);
		setSelectorMode("assign");
		setSelectorLoading(true);
		try {
			const response = await getFarmLands({});
			setAvailableLands(response.data || []);
		} catch {
			message.error("可分配地块加载失败，请重试");
		} finally {
			setSelectorLoading(false);
		}
	};

	/** 记录选择历史并写入新的地块 ID 集合。 */
	const updateSelection = (nextIds: string[]) => {
		setSelectionHistory(history => [...history, selectorSelectedIds]);
		setSelectorSelectedIds([...new Set(nextIds)]);
	};

	/** 切换单个地块的选择状态。 */
	const toggleLand = (landId: string) => {
		updateSelection(
			selectorSelectedIds.includes(landId) ? selectorSelectedIds.filter(id => id !== landId) : [...selectorSelectedIds, landId]
		);
		setFocusedLandId(landId);
	};

	/** 合并矩形框选命中的地块。 */
	const selectRectangleLands = (landIds: string[]) => {
		updateSelection([...selectorSelectedIds, ...landIds]);
		setRectangleSelecting(false);
		message.success(`已框选 ${landIds.length} 块地`);
	};

	/** 撤销最近一次地块选择。 */
	const undoSelection = () => {
		setSelectionHistory(history => {
			if (!history.length) return history;
			const previous = history[history.length - 1];
			setSelectorSelectedIds(previous);
			return history.slice(0, -1);
		});
	};

	/** 关闭地图选地并恢复任务地图。 */
	const closeSelector = () => {
		setSelectorMode(undefined);
		setAssignmentRecord(undefined);
		setRectangleSelecting(false);
		setFocusedLandId(undefined);
	};

	/** 确认编辑选地或任务分配。 */
	const confirmSelector = async () => {
		if (selectorMode === "editor") {
			setEditorLandIds(selectorSelectedIds);
			closeSelector();
			return;
		}
		if (!assignmentRecord) return;
		setWorking(true);
		try {
			const params: FarmAssignmentForm = { farmingId: assignmentRecord.farmingId, assignMobile, landIds: selectorSelectedIds };
			await assignFarmTask(params);
			message.success("农事地块分配成功");
			closeSelector();
			setRevision(value => value + 1);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "分配失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 导出当前筛选范围内的农事任务。 */
	const exportTasks = async () => {
		setWorking(true);
		try {
			const response = await exportFarmTaskList({ ...filters, workStatus });
			if (!response.data) throw new Error("未生成导出文件");
			const blob = await downloadFarmTaskExport(response.data);
			saveBlob(blob, "农事列表.csv");
			message.success("农事列表导出成功");
		} catch {
			message.error("导出失败，请重试");
		} finally {
			setWorking(false);
		}
	};

	/** 渲染单个农事任务的操作浮层。 */
	const renderTaskActions = (record: FarmTaskRecord) => (
		<div className="farm-task-actions">
			<button onClick={() => openEditor(record)}>
				<EditOutlined />
				编辑
			</button>
			<button onClick={() => void openAssignment(record)}>
				<CheckSquareOutlined />
				分配地块
			</button>
			<button onClick={() => message.warning("转移农事功能暂未开放")}>
				<ReloadOutlined />
				转移农事
			</button>
		</div>
	);

	// 渲染农事任务列表、地图、选地工具和业务抽屉。
	return (
		<section className={`farm-map-page${sidebarCollapsed ? " is-collapsed" : ""}`}>
			{/* 左侧农事搜索、统计和任务列表 */}
			<aside className="farm-sidebar">
				<div className="farm-sidebar-search">
					<Input.Search
						value={keyword}
						allowClear
						placeholder="请输入关键字搜索"
						onChange={event => setKeyword(event.target.value)}
						onSearch={searchTasks}
					/>
					<Tooltip title="筛选">
						<Button icon={<FilterOutlined />} onClick={() => setFilterVisible(true)} />
					</Tooltip>
					<Tooltip title="新建">
						<Button icon={<PlusOutlined />} onClick={() => openEditor()} />
					</Tooltip>
					<Tooltip title="导出">
						<Button icon={<DownloadOutlined />} loading={working} onClick={() => void exportTasks()} />
					</Tooltip>
				</div>
				{/* 农事面积和完成度统计 */}
				<div className="farm-area-summary">
					<div>
						<strong>{areaCount.countTotalArea}</strong>
						<span>总面积(亩)</span>
					</div>
					<div>
						<strong>{areaCount.countWorkArea}</strong>
						<span>作业面积(亩)</span>
					</div>
					<div>
						<strong>{areaCount.countFinishNum}%</strong>
						<span>完成度</span>
					</div>
				</div>
				{/* 全部、作业中和已完成状态切换 */}
				<Tabs activeKey={workStatus} centered onChange={value => setWorkStatus(value as "" | FarmWorkStatus)}>
					<Tabs.TabPane tab={`全部(${statusCount.allCount})`} key="" />
					<Tabs.TabPane tab={`作业中(${statusCount.workingCount})`} key="1" />
					<Tabs.TabPane tab={`已完成(${statusCount.finishedCount})`} key="2" />
				</Tabs>
				{/* 农事任务和地块明细列表 */}
				<div className="farm-task-list">
					<Spin spinning={loading}>
						{tasks.length ? (
							tasks.map(task => (
								<article
									key={task.farmingId}
									className={`farm-task-card${selectedTaskId === task.farmingId ? " is-active" : ""}`}
									onClick={() => {
										setSelectedTaskId(task.farmingId);
										setFocusedLandId(undefined);
									}}
								>
									<div className="farm-task-heading">
										<div>
											<strong>{task.farmingName}</strong>
											<Tag color={task.workStatus === "1" ? "orange" : "blue"}>
												{task.workStatus === "1" ? "作业中" : "已完成"}
											</Tag>
										</div>
										<Space size={0}>
											<Button
												type="text"
												size="small"
												icon={expandedTaskId === task.farmingId ? <UndoOutlined /> : <EyeOutlined />}
												onClick={event => {
													event.stopPropagation();
													setExpandedTaskId(current => (current === task.farmingId ? "" : task.farmingId));
												}}
											/>
											<Popover trigger="click" placement="bottomRight" content={renderTaskActions(task)}>
												<Button type="text" size="small" icon={<MoreOutlined />} onClick={event => event.stopPropagation()} />
											</Popover>
										</Space>
									</div>
									<div className="farm-task-meta">
										<span>
											作业周期：{task.workBeginTime}~{task.workEndTime}
										</span>
										<span>
											区域经理：{task.nickName}-{task.mobile}
										</span>
										<span>
											机耕队长：{task.teamName}-{task.teamMobile}
										</span>
									</div>
									<div className="farm-task-count">
										<span>
											总面积：<em>{task.totalArea}</em>亩
										</span>
										<i />
										<span>
											已完成：<em>{task.workArea}</em>亩
										</span>
										<i />
										<span>
											地块：<em>{task.landNum}</em>块
										</span>
									</div>
									<Progress percent={task.finishNum} showInfo={false} size="small" />
									{expandedTaskId === task.farmingId && (
										<div className="farm-task-lands">
											{task.lands.map(land => (
												<button
													key={land.id}
													className={focusedLandId === land.id ? "is-active" : ""}
													onClick={event => {
														event.stopPropagation();
														setSelectedTaskId(task.farmingId);
														setFocusedLandId(land.id);
													}}
												>
													<span className={`farm-land-dot is-type-${land.landType}`} />
													<div>
														<strong>
															{land.landName}（{land.actualAcreNum}亩）
														</strong>
														<span>
															上传人：{land.createName}-{land.createMobile}
														</span>
														<span>创建时间：{land.createTime}</span>
													</div>
													<span
														className="farm-detail-link"
														onClick={event => {
															event.stopPropagation();
															void openDetail(task);
														}}
													>
														农事详情
													</span>
												</button>
											))}
										</div>
									)}
								</article>
							))
						) : (
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无农事任务" />
						)}
					</Spin>
				</div>
			</aside>
			{/* 左侧列表收起按钮 */}
			<Button
				className="farm-sidebar-collapse"
				icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
				onClick={() => setSidebarCollapsed(value => !value)}
				aria-label={sidebarCollapsed ? "展开农事列表" : "收起农事列表"}
			/>
			{/* 地图地块选择工具栏 */}
			{selectorMode && (
				<div className="farm-land-selection-tools">
					<button
						className={availableLands.length > 0 && selectorSelectedIds.length === availableLands.length ? "is-active" : ""}
						onClick={() => updateSelection(availableLands.map(land => land.id))}
					>
						<CheckSquareOutlined />
						全选
					</button>
					<button className={rectangleSelecting ? "is-active" : ""} onClick={() => setRectangleSelecting(value => !value)}>
						<SelectOutlined />
						矩形选择
					</button>
					<button disabled={!selectionHistory.length} onClick={undoSelection}>
						<UndoOutlined />
						撤销
					</button>
					<button disabled={!selectorSelectedIds.length} onClick={() => updateSelection([])}>
						<ClearOutlined />
						重选
					</button>
				</div>
			)}
			{/* 农事地块和作业轨迹地图 */}
			<div className="farm-map-main">
				<FarmMapCanvas
					lands={mapLands}
					trajectories={selectorMode ? [] : trajectories}
					selectedLandIds={mapSelectedIds}
					focusedLandId={focusedLandId}
					rectangleSelecting={rectangleSelecting}
					onLandClick={landId => (selectorMode ? toggleLand(landId) : setFocusedLandId(landId))}
					onRectangleSelect={selectRectangleLands}
				/>
			</div>
			{/* 筛选、详情、编辑和地图选地抽屉 */}
			<FarmFilterDrawer
				visible={filterVisible}
				filters={filters}
				options={formOptions}
				onClose={() => setFilterVisible(false)}
				onApply={applyAdvancedFilters}
			/>
			<FarmDetailDrawer
				visible={!!detailRecord}
				record={detailRecord}
				loading={detailLoading}
				onClose={() => setDetailRecord(undefined)}
				onEdit={record => {
					setDetailRecord(undefined);
					openEditor(record);
				}}
			/>
			<FarmEditorDrawer
				visible={editorVisible}
				record={editorRecord}
				options={formOptions}
				selectedLands={editorSelectedLands}
				saving={working}
				onClose={() => {
					setEditorVisible(false);
					setEditorRecord(undefined);
				}}
				onSelectLands={request => void openEditorLandSelector(request)}
				onSave={values => void saveTask(values)}
			/>
			<FarmLandSelector
				visible={!!selectorMode}
				mode={selectorMode || "editor"}
				lands={availableLands}
				selectedIds={selectorSelectedIds}
				assignMobile={assignMobile}
				loading={selectorLoading}
				confirming={working}
				onToggle={toggleLand}
				onAssignMobileChange={setAssignMobile}
				onClose={closeSelector}
				onConfirm={() => void confirmSelector()}
			/>
		</section>
	);
};

export default FarmMap;
