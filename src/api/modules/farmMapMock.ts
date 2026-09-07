import type { ResultData } from "@/api/interface";
import type {
	FarmAreaCount,
	FarmAssignmentForm,
	FarmFormOptions,
	FarmLandListParams,
	FarmMapLand,
	FarmStatusCount,
	FarmTaskForm,
	FarmTaskListParams,
	FarmTaskPage,
	FarmTaskRecord,
	FarmTrajectory,
	FarmWorkStatus
} from "@/api/interface/farmMap";

/** 创建符合项目请求层约定的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝 Mock 数据，避免页面修改引用污染数据源。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 生成 EPSG:4326 地块闭合边界。 */
const createPolygon = (landId: string, longitude: number, latitude: number, width = 0.006, height = 0.004) => [
	{ landId, lng: longitude, lat: latitude, sort: 1 },
	{ landId, lng: longitude + width, lat: latitude + 0.0004, sort: 2 },
	{ landId, lng: longitude + width - 0.0005, lat: latitude + height, sort: 3 },
	{ landId, lng: longitude - 0.0004, lat: latitude + height - 0.0003, sort: 4 },
	{ landId, lng: longitude, lat: latitude, sort: 5 }
];

/** 农事地图可分配的全部 Mock 地块。 */
const mockLands: FarmMapLand[] = [
	{
		id: "farm-land-1001",
		landName: "北王村东一号田",
		landType: "1",
		actualAcreNum: 12.68,
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2026-02-18 09:24:10",
		gpsList: createPolygon("farm-land-1001", 115.013, 38.506)
	},
	{
		id: "farm-land-1002",
		landName: "北王村东二号田",
		landType: "1",
		actualAcreNum: 9.3,
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2026-02-20 15:16:42",
		gpsList: createPolygon("farm-land-1002", 115.021, 38.506, 0.005, 0.0045)
	},
	{
		id: "farm-land-1003",
		landName: "北王村南侧托管田",
		landType: "2",
		actualAcreNum: 18,
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2026-03-02 11:08:36",
		gpsList: createPolygon("farm-land-1003", 115.031, 38.496, 0.008, 0.005)
	},
	{
		id: "farm-land-1004",
		landName: "西王村示范田",
		landType: "1",
		actualAcreNum: 22.1,
		createName: "张晓峰",
		createMobile: "13900139001",
		createTime: "2026-03-08 16:30:12",
		gpsList: createPolygon("farm-land-1004", 115.041, 38.509, 0.009, 0.005)
	},
	{
		id: "farm-land-1005",
		landName: "西王村西三号田",
		landType: "2",
		actualAcreNum: 15.46,
		createName: "刘洋",
		createMobile: "13800138003",
		createTime: "2026-03-12 10:18:26",
		gpsList: createPolygon("farm-land-1005", 115.052, 38.499, 0.007, 0.004)
	},
	{
		id: "farm-land-1006",
		landName: "南王村机耕田",
		landType: "1",
		actualAcreNum: 11.82,
		createName: "刘洋",
		createMobile: "13800138003",
		createTime: "2026-03-18 14:22:08",
		gpsList: createPolygon("farm-land-1006", 115.004, 38.493, 0.006, 0.004)
	},
	{
		id: "farm-land-1007",
		landName: "东王村北侧田",
		landType: "2",
		actualAcreNum: 16.35,
		createName: "王海涛",
		createMobile: "13800138004",
		createTime: "2026-03-22 08:56:31",
		gpsList: createPolygon("farm-land-1007", 115.062, 38.51, 0.0065, 0.0042)
	},
	{
		id: "farm-land-1008",
		landName: "东王村南侧田",
		landType: "1",
		actualAcreNum: 13.24,
		createName: "王海涛",
		createMobile: "13800138004",
		createTime: "2026-03-25 13:12:50",
		gpsList: createPolygon("farm-land-1008", 115.061, 38.491, 0.006, 0.0045)
	}
];

/** 农事编辑器使用的 Mock 下拉选项。 */
const mockOptions: FarmFormOptions = {
	crops: [
		{ value: "wheat", label: "小麦" },
		{ value: "corn", label: "玉米" },
		{ value: "soybean", label: "大豆" }
	],
	farmingTypes: [
		{ value: "type-sow", label: "播种", parentValue: "wheat" },
		{ value: "type-spray", label: "植保喷药", parentValue: "wheat" },
		{ value: "type-harvest", label: "收获", parentValue: "corn" },
		{ value: "type-fertilize", label: "追肥", parentValue: "corn" },
		{ value: "type-tillage", label: "整地", parentValue: "soybean" }
	],
	standards: [
		{ value: "science-wheat", label: "小麦高产种植标准", parentValue: "wheat" },
		{ value: "science-corn", label: "玉米绿色生产标准", parentValue: "corn" },
		{ value: "science-soybean", label: "大豆机械化作业标准", parentValue: "soybean" }
	],
	managers: [
		{ value: "manager-1", label: "张晓峰", mobile: "13900139001" },
		{ value: "manager-2", label: "王海涛", mobile: "13900139002" },
		{ value: "manager-3", label: "刘晓燕", mobile: "13900139003" }
	]
};

/** 根据任务状态创建完整 Mock 农事任务。 */
const createTask = (
	id: number,
	status: FarmWorkStatus,
	landIndexes: number[],
	overrides: Partial<FarmTaskRecord> = {}
): FarmTaskRecord => {
	// 复制任务关联地块，避免任务间共享可变对象。
	const lands = landIndexes.map(index => clone(mockLands[index]));
	// 汇总任务全部地块面积。
	const totalArea = Number(lands.reduce((sum, land) => sum + land.actualAcreNum, 0).toFixed(2));
	// 已完成任务使用全部面积，作业中任务按进度计算。
	const finishNum = status === "2" ? 100 : 35 + id * 12;
	const workArea = Number((totalArea * (finishNum / 100)).toFixed(2));
	// 任务对应的作物、类型和标准。
	const crop = id === 3 ? "corn" : "wheat";
	const cropLabel = crop === "corn" ? "玉米" : "小麦";
	const farmingTypeId = id === 1 ? "type-sow" : id === 2 ? "type-spray" : "type-harvest";
	const farmingTypeName = id === 1 ? "播种" : id === 2 ? "植保喷药" : "收获";

	return {
		farmingId: `farming-${id}`,
		farmingName: `${cropLabel}${farmingTypeName}任务`,
		dictLabel: cropLabel,
		dictValue: crop,
		farmingTypeId,
		farmingTypeName,
		farmingScienceId: crop === "corn" ? "science-corn" : "science-wheat",
		farmingScienceName: crop === "corn" ? "玉米绿色生产标准" : "小麦高产种植标准",
		workStatus: status,
		workBeginTime: `2026-0${id + 3}-01`,
		workEndTime: `2026-0${id + 3}-20`,
		managerId: `manager-${Math.min(id, 3)}`,
		nickName: ["张晓峰", "王海涛", "刘晓燕"][id - 1],
		mobile: `1390013900${id}`,
		teamName: `${["春耕", "丰收", "先锋"][id - 1]}机耕队`,
		teamMobile: `1370013700${id}`,
		teamMemberVoList: [
			{ id: `member-${id}-1`, teamMemberName: "李师傅", teamMemberMobile: `1360013600${id}` },
			{ id: `member-${id}-2`, teamMemberName: "赵师傅", teamMemberMobile: `1350013500${id}` }
		],
		lands,
		landNum: lands.length,
		totalArea,
		workArea,
		finishNum,
		typeFieldOptionRequestList: [
			{ id: `standard-${id}-1`, farmingFieldName: "作业深度", farmingFieldOptionContent: id === 1 ? "3～5 厘米" : "8～10 厘米" },
			{ id: `standard-${id}-2`, farmingFieldName: "作业要求", farmingFieldOptionContent: "匀速作业，避免重复覆盖" }
		],
		createBy: "系统管理员",
		createMobile: "13800138000",
		createTime: `2026-0${id + 2}-12 09:30:00`,
		createSource: "2",
		assignBy: "农事调度员",
		assignMobile: "13800138020",
		assignTime: `2026-0${id + 2}-15 14:20:00`,
		assignSource: "2",
		...overrides
	};
};

/** 支持新增、编辑和分配的农事任务 Mock 数据源。 */
let mockTasks: FarmTaskRecord[] = [createTask(1, "1", [0, 1, 2]), createTask(2, "1", [3, 4]), createTask(3, "2", [5, 6, 7])];

/** 按任务保存计划与实际作业轨迹。 */
const mockTrajectories: Record<string, FarmTrajectory[]> = {
	"farming-1": [
		{
			farmingLocusId: "locus-1-planned",
			locusType: "planned",
			locusGpsList: [
				{ lng: 115.014, lat: 38.507, time: "2026-04-03 08:00:00" },
				{ lng: 115.018, lat: 38.508, time: "2026-04-03 08:10:00" },
				{ lng: 115.023, lat: 38.508, time: "2026-04-03 08:20:00" }
			]
		},
		{
			farmingLocusId: "locus-1-actual",
			locusType: "actual",
			locusGpsList: [
				{ lng: 115.014, lat: 38.5074, time: "2026-04-03 08:02:00" },
				{ lng: 115.0175, lat: 38.5084, time: "2026-04-03 08:12:00" },
				{ lng: 115.0226, lat: 38.5078, time: "2026-04-03 08:22:00" }
			]
		}
	],
	"farming-2": [
		{
			farmingLocusId: "locus-2-actual",
			locusType: "actual",
			locusGpsList: [
				{ lng: 115.042, lat: 38.5102, time: "2026-05-08 09:00:00" },
				{ lng: 115.047, lat: 38.512, time: "2026-05-08 09:18:00" },
				{ lng: 115.052, lat: 38.501, time: "2026-05-08 09:38:00" }
			]
		}
	],
	"farming-3": [
		{
			farmingLocusId: "locus-3-actual",
			locusType: "actual",
			locusGpsList: [
				{ lng: 115.006, lat: 38.495, time: "2026-06-12 07:30:00" },
				{ lng: 115.063, lat: 38.512, time: "2026-06-12 10:45:00" },
				{ lng: 115.064, lat: 38.493, time: "2026-06-12 13:20:00" }
			]
		}
	]
};

/** 暂存农事列表导出的 CSV 文件。 */
const mockExports = new Map<string, Blob>();

/** 判断文本字段是否满足模糊匹配。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.toLowerCase());

/** 判断农事任务是否满足列表筛选。 */
const matchesFilters = (record: FarmTaskRecord, params: FarmTaskListParams) => {
	if (
		params.searchValue &&
		![record.farmingName, record.nickName, record.teamName].some(value => includesFilter(value, params.searchValue))
	) {
		return false;
	}
	if (params.dictValue && record.dictValue !== params.dictValue) return false;
	if (params.farmingTypeId && record.farmingTypeId !== params.farmingTypeId) return false;
	if (params.workStatus && record.workStatus !== params.workStatus) return false;
	if (!includesFilter(record.createBy, params.createBy) || !includesFilter(record.teamMobile, params.teamMobile)) return false;
	if (!includesFilter(record.mobile, params.mobile)) return false;
	if (params.createBeginTime && record.createTime.slice(0, 10) < params.createBeginTime) return false;
	if (params.createEndTime && record.createTime.slice(0, 10) > params.createEndTime) return false;
	if (params.beginTotalArea != null && record.totalArea < Number(params.beginTotalArea)) return false;
	if (params.endsTotalArea != null && record.totalArea > Number(params.endsTotalArea)) return false;
	if (params.workBeginArea != null && record.workArea < Number(params.workBeginArea)) return false;
	return !(params.workEndArea != null && record.workArea > Number(params.workEndArea));
};

/** 获取符合当前筛选的全部农事任务。 */
const getFilteredTasks = (params: FarmTaskListParams) => mockTasks.filter(record => matchesFilters(record, params));

/** 查询农事地图任务列表。 */
export const getMockFarmTaskList = (params: FarmTaskListParams): Promise<ResultData<FarmTaskPage>> => {
	// 获取筛选后的任务副本。
	const rows = clone(getFilteredTasks(params));
	return success({ rows, total: rows.length });
};

/** 查询农事任务状态统计。 */
export const getMockFarmStatusCount = (params: FarmTaskListParams): Promise<ResultData<FarmStatusCount>> => {
	// 状态统计忽略当前状态页签本身。
	const records = getFilteredTasks({ ...params, workStatus: "" });
	return success({
		allCount: records.length,
		workingCount: records.filter(record => record.workStatus === "1").length,
		finishedCount: records.filter(record => record.workStatus === "2").length
	});
};

/** 查询农事任务面积和完成度统计。 */
export const getMockFarmAreaCount = (params: FarmTaskListParams): Promise<ResultData<FarmAreaCount>> => {
	// 面积统计与当前全部筛选条件保持一致。
	const records = getFilteredTasks(params);
	// 汇总任务计划面积和完成面积。
	const countTotalArea = Number(records.reduce((sum, record) => sum + record.totalArea, 0).toFixed(2));
	const countWorkArea = Number(records.reduce((sum, record) => sum + record.workArea, 0).toFixed(2));
	return success({
		countTotalArea,
		countWorkArea,
		countFinishNum: countTotalArea ? Math.round((countWorkArea / countTotalArea) * 100) : 0
	});
};

/** 查询农事任务详情。 */
export const getMockFarmTaskDetail = (farmingId: string): Promise<ResultData<FarmTaskRecord>> => {
	// 按业务 ID 查找任务。
	const record = mockTasks.find(item => item.farmingId === farmingId);
	return record ? success(clone(record)) : Promise.reject(new Error("未找到农事任务"));
};

/** 查询农事任务的计划和实际作业轨迹。 */
export const getMockFarmTrajectories = (farmingId: string): Promise<ResultData<FarmTrajectory[]>> =>
	success(clone(mockTrajectories[farmingId] || []));

/** 查询农事地图可选择的地块。 */
export const getMockFarmLands = (params: FarmLandListParams): Promise<ResultData<FarmMapLand[]>> => {
	// 当前 Mock 仅按经营类型筛选，保留其他字段作为真实接口边界。
	const records = params.landType ? mockLands.filter(land => land.landType === params.landType) : mockLands;
	return success(clone(records));
};

/** 查询农事编辑器基础选项。 */
export const getMockFarmFormOptions = (): Promise<ResultData<FarmFormOptions>> => success(clone(mockOptions));

/** 根据表单字段创建或更新任务公共属性。 */
const applyTaskForm = (record: FarmTaskRecord, params: FarmTaskForm): FarmTaskRecord => {
	// 查询当前表单选中的基础选项。
	const crop = mockOptions.crops.find(item => item.value === params.dictValue);
	const farmingType = mockOptions.farmingTypes.find(item => item.value === params.farmingTypeId);
	const standard = mockOptions.standards.find(item => item.value === params.farmingScienceId);
	const manager = mockOptions.managers.find(item => item.value === params.managerId);
	// 复制当前选中的地块。
	const lands = mockLands.filter(land => params.landIds.includes(land.id)).map(clone);
	// 汇总地块面积。
	const totalArea = Number(lands.reduce((sum, land) => sum + land.actualAcreNum, 0).toFixed(2));
	return {
		...record,
		farmingName: params.farmingName,
		dictLabel: crop?.label || record.dictLabel,
		dictValue: params.dictValue,
		farmingTypeId: params.farmingTypeId,
		farmingTypeName: farmingType?.label || record.farmingTypeName,
		farmingScienceId: params.farmingScienceId,
		farmingScienceName: standard?.label || record.farmingScienceName,
		workBeginTime: params.workBeginTime,
		workEndTime: params.workEndTime,
		managerId: params.managerId,
		nickName: manager?.label || record.nickName,
		mobile: manager?.mobile || record.mobile,
		teamMobile: params.teamMobile,
		lands,
		landNum: lands.length,
		totalArea,
		workArea: Math.min(record.workArea, totalArea),
		finishNum: totalArea ? Math.round((Math.min(record.workArea, totalArea) / totalArea) * 100) : 0
	};
};

/** 新增农事任务。 */
export const addMockFarmTask = (params: FarmTaskForm): Promise<ResultData<null>> => {
	// 使用现有任务结构生成完整初始记录。
	const id = Date.now();
	const base = createTask(1, "1", [], {
		farmingId: `farming-${id}`,
		createTime: "2026-09-07 10:00:00",
		assignTime: "2026-09-07 10:00:00",
		workArea: 0,
		finishNum: 0
	});
	mockTasks = [applyTaskForm(base, params), ...mockTasks];
	return success(null);
};

/** 编辑农事任务。 */
export const editMockFarmTask = (params: FarmTaskForm): Promise<ResultData<null>> => {
	// 定位需要更新的任务。
	const index = mockTasks.findIndex(record => record.farmingId === params.farmingId);
	if (index < 0) return Promise.reject(new Error("未找到农事任务"));
	mockTasks[index] = applyTaskForm(mockTasks[index], params);
	return success(null);
};

/** 为农事任务重新分配地块和所属账号。 */
export const assignMockFarmTask = (params: FarmAssignmentForm): Promise<ResultData<null>> => {
	// 定位需要分配的任务。
	const record = mockTasks.find(item => item.farmingId === params.farmingId);
	if (!record) return Promise.reject(new Error("未找到农事任务"));
	// 更新任务地块和分配信息。
	const lands = mockLands.filter(land => params.landIds.includes(land.id)).map(clone);
	record.lands = lands;
	record.landNum = lands.length;
	record.totalArea = Number(lands.reduce((sum, land) => sum + land.actualAcreNum, 0).toFixed(2));
	record.workArea = Math.min(record.workArea, record.totalArea);
	record.finishNum = record.totalArea ? Math.round((record.workArea / record.totalArea) * 100) : 0;
	record.assignMobile = params.assignMobile;
	record.assignTime = "2026-09-07 10:20:00";
	return success(null);
};

/** 生成当前筛选结果的农事列表 CSV。 */
export const exportMockFarmTaskList = (params: FarmTaskListParams): Promise<ResultData<string>> => {
	// 获取导出范围内的全部农事任务。
	const records = getFilteredTasks(params);
	// 定义导出表头和内容行。
	const header = "农事名称,作物,农事类型,作业状态,作业周期,区域经理,机耕队长,总面积,作业面积,地块数量";
	const rows = records.map(record =>
		[
			record.farmingName,
			record.dictLabel,
			record.farmingTypeName,
			record.workStatus === "1" ? "作业中" : "已完成",
			`${record.workBeginTime}~${record.workEndTime}`,
			record.nickName,
			record.teamName,
			record.totalArea,
			record.workArea,
			record.landNum
		].join(",")
	);
	// 暂存生成的 CSV Blob。
	const fileName = `mock-farming-${Date.now()}.csv`;
	mockExports.set(fileName, new Blob(["\uFEFF", header, "\n", rows.join("\n")], { type: "text/csv;charset=utf-8" }));
	return success(fileName);
};

/** 下载先前生成的农事列表 CSV。 */
export const downloadMockFarmTaskExport = (fileName: string): Promise<Blob> => {
	// 读取内存中对应的导出文件。
	const file = mockExports.get(fileName);
	return file ? Promise.resolve(file) : Promise.reject(new Error("导出文件不存在"));
};
