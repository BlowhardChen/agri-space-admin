import type {
	LandAddress,
	LandCensus,
	LandContract,
	LandContractForm,
	LandEditForm,
	LandListParams,
	LandPage,
	LandRecord,
	MergeLandParams,
	TransferLandItem,
	UploadedFile,
	VillageForm,
	VillageListParams,
	VillageRecord
} from "@/api/interface/land";
import type { ResultData } from "@/api/interface";

/** 创建与当前请求层一致的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝本地业务数据，避免页面修改引用污染 mock 数据源。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 构造与地约土地信息页面相同字段形状的多边形坐标。 */
const createPolygon = (landId: string, longitude: number, latitude: number) => [
	{ landId, lng: longitude, lat: latitude, sort: 1 },
	{ landId, lng: longitude + 0.008, lat: latitude, sort: 2 },
	{ landId, lng: longitude + 0.007, lat: latitude + 0.006, sort: 3 },
	{ landId, lng: longitude - 0.001, lat: latitude + 0.005, sort: 4 },
	{ landId, lng: longitude, lat: latitude, sort: 5 }
];

/** 提供给详情与合同编辑的示例合同。 */
const landContract: LandContract = {
	id: "contract-1001",
	landId: "land-1001",
	contractNo: "DY-2025-001",
	termOfLease: 5,
	startTime: "2025-01-01",
	endTime: "2029-12-31",
	perAcreAmount: 820,
	totalAmount: 51988,
	paymentAmount: 10397.6,
	paymentMethod: "1",
	actualAcreNum: 12.68,
	detailaddress: "河北省保定市定州市东亭镇北王村东侧",
	createName: "系统管理员",
	times: [{ paymentTime: "01-15" }]
};

/** 模拟地约后台的正常地块、托管地块和合并地块数据。 */
let mockLands: LandRecord[] = [
	{
		id: "land-1001",
		type: "2",
		landType: "1",
		landName: "王建国 · 东侧地块",
		acreageNum: 12.91,
		actualAcreNum: 12.68,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "北王村东侧 1 号田",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2025-03-18 09:24:10",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		mobile: "13800138011",
		cardid: "130682198905162013",
		bankAccount: "6217000012345678901",
		gpsList: createPolygon("land-1001", 115.013, 38.506),
		landContract
	},
	{
		id: "land-1002",
		type: "2",
		landType: "1",
		landName: "王建国 · 西侧地块",
		acreageNum: 9.46,
		actualAcreNum: 9.3,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "北王村西侧 2 号田",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2025-04-06 15:16:42",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		mobile: "13800138011",
		cardid: "130682198905162013",
		bankAccount: "6217000012345678901",
		gpsList: createPolygon("land-1002", 115.023, 38.507)
	},
	{
		id: "land-1003",
		type: "2",
		landType: "2",
		landName: "赵秀兰 · 托管地块",
		acreageNum: 18.25,
		actualAcreNum: 18,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "北王村南侧 3 号田",
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2025-04-23 11:08:36",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		mobile: "13800138012",
		cardid: "130682197707184821",
		bankAccount: "6217000012345678902",
		gpsList: createPolygon("land-1003", 115.035, 38.494)
	},
	{
		id: "merge-2001",
		type: "1",
		landType: "1",
		landName: "北王村示范田",
		acreageNum: 22.47,
		actualAcreNum: 22.1,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "北王村北侧示范区",
		createName: "系统管理员",
		createMobile: "13800138000",
		createTime: "2025-05-09 16:30:12",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		gpsList: createPolygon("merge-2001", 115.043, 38.512),
		landList: [
			{
				id: "land-2002",
				type: "2",
				landType: "1",
				landName: "刘海燕 · 一分田",
				actualAcreNum: 10.4,
				acreageNum: 10.62,
				province: "河北省",
				city: "保定市",
				district: "定州市",
				township: "东亭镇",
				administrativeVillage: "北王村",
				detailaddress: "北王村北侧 1 号田",
				createName: "周志强",
				createMobile: "13800138002",
				createTime: "2025-02-15 10:12:28",
				mobile: "13800138013",
				gpsList: createPolygon("land-2002", 115.044, 38.514)
			},
			{
				id: "land-2003",
				type: "2",
				landType: "1",
				landName: "刘海燕 · 二分田",
				actualAcreNum: 11.7,
				acreageNum: 11.85,
				province: "河北省",
				city: "保定市",
				district: "定州市",
				township: "东亭镇",
				administrativeVillage: "北王村",
				detailaddress: "北王村北侧 2 号田",
				createName: "周志强",
				createMobile: "13800138002",
				createTime: "2025-02-15 10:16:42",
				mobile: "13800138013",
				gpsList: createPolygon("land-2003", 115.052, 38.514)
			}
		]
	},
	{
		id: "land-9001",
		type: "2",
		landType: "1",
		landName: "陈国强 · 已退地块",
		acreageNum: 6.34,
		actualAcreNum: 6.1,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "北王村西南侧",
		createName: "刘洋",
		createMobile: "13800138003",
		createTime: "2025-01-19 14:22:08",
		quitStatus: "1",
		gpsList: createPolygon("land-9001", 115.006, 38.49)
	}
];

/** 模拟地约后台行政村管理页的可维护村级数据。 */
let mockVillages: VillageRecord[] = [
	{ id: "village-1", name: "北王村", status: "1", deptName: "东亭镇", createBy: "系统管理员", createTime: "2025-01-12 09:20:34" },
	{ id: "village-2", name: "西王村", status: "1", deptName: "东亭镇", createBy: "李春梅", createTime: "2025-02-08 14:16:22" },
	{ id: "village-3", name: "南王村", status: "0", deptName: "东亭镇", createBy: "周志强", createTime: "2025-03-26 10:08:56" },
	{ id: "village-4", name: "东王村", status: "1", deptName: "东亭镇", createBy: "张晓峰", createTime: "2025-05-18 16:45:12" }
];

/** 暂存导出文件内容，以匹配先生成文件名、再下载的地约页面流程。 */
const mockExports = new Map<string, Blob>();

/** 在顶层地块和合并子地块中查找指定 ID。 */
const findLand = (landId: string) => {
	for (const land of mockLands) {
		if (land.id === landId) return land;
		const child = land.landList?.find(item => item.id === landId);
		if (child) return child;
	}
	return undefined;
};

/** 比较文本筛选值，空条件视为匹配。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.toLowerCase());

/** 判断一条地块是否符合地约列表的本地筛选条件。 */
const matchesFilters = (land: LandRecord, params: LandListParams) => {
	const searchTarget = [land.landName, land.mobile, land.cardid, land.detailaddress, land.administrativeVillage].join(" ");
	if (!includesFilter(searchTarget, params.searchValue)) return false;
	if (params.type && land.type !== params.type) return false;
	if (params.landType && land.landType !== params.landType) return false;
	if (params.contractType && land.landType !== params.contractType) return false;
	if (!includesFilter(land.cardid, params.cardid) || !includesFilter(land.bankAccount, params.bankAccount)) return false;
	if (!includesFilter(land.landName, params.relename) || !includesFilter(land.mobile, params.mobile)) return false;
	if (!includesFilter(land.memberName, params.areaManager) || !includesFilter(land.detailaddress, params.detailaddress))
		return false;
	if (params.province && land.province !== params.province) return false;
	if (params.city && land.city !== params.city) return false;
	if (params.district && land.district !== params.district) return false;
	if (params.township && land.township !== params.township) return false;
	if (params.administrativeVillage && land.administrativeVillage !== params.administrativeVillage) return false;
	if (params.beginActualNum != null && land.actualAcreNum < params.beginActualNum) return false;
	if (params.endActualNum != null && land.actualAcreNum > params.endActualNum) return false;
	const createDate = land.createTime?.slice(0, 10) || "";
	if (params.beginTime && createDate < params.beginTime) return false;
	return !(params.endsTime && createDate > params.endsTime);
};

/** 查询已按状态和筛选条件过滤的本地地块列表。 */
export const getMockLandList = (params: LandListParams): Promise<ResultData<LandPage<LandRecord>>> => {
	const rows = mockLands.filter(land => (params.quitStatus === "1" ? land.quitStatus === "1" : land.quitStatus !== "1"));
	const matchedRows = rows.filter(land => matchesFilters(land, params));
	return success({ rows: clone(matchedRows), total: matchedRows.length, pageNum: 1, pageSize: matchedRows.length });
};

/** 统计当前正常或退地数据的面积、数量和行政村数。 */
export const getMockLandCensus = (quitStatus: "0" | "1" = "0"): Promise<ResultData<LandCensus>> => {
	const rows = mockLands.filter(land => (quitStatus === "1" ? land.quitStatus === "1" : land.quitStatus !== "1"));
	return success({
		acreageCount: Number(rows.reduce((sum, land) => sum + land.actualAcreNum, 0).toFixed(2)),
		landNum: rows.length,
		administrativeVillageCount: new Set(rows.map(land => land.administrativeVillage).filter(Boolean)).size
	});
};

/** 获取单条本地地块的完整详情。 */
export const getMockLandDetail = (landId: string): Promise<ResultData<LandRecord>> => {
	const land = findLand(landId);
	if (!land) return Promise.reject(new Error("未找到地块"));
	return success(clone(land));
};

/** 生成可下载的 UTF-8 CSV 内容，并返回模拟的导出文件名。 */
export const exportMockLandList = async (params: LandListParams): Promise<ResultData<string>> => {
	const list = await getMockLandList(params);
	const fileName = `地块列表-${Date.now()}.csv`;
	const content = [
		"地块名称,类型,实际亩数,行政村,手机号",
		...(list.data?.rows || []).map(land =>
			[
				land.landName,
				land.landType === "1" ? "流转" : "托管",
				land.actualAcreNum,
				land.administrativeVillage || "",
				land.mobile || ""
			].join(",")
		)
	].join("\n");
	mockExports.set(fileName, new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" }));
	return success(fileName);
};

/** 返回由本地导出步骤生成的文件内容。 */
export const downloadMockLandExport = (fileName: string): Promise<Blob> => {
	const file = mockExports.get(fileName);
	if (!file) return Promise.reject(new Error("导出文件不存在"));
	return Promise.resolve(file);
};

/** 将多条普通地块合并为一条可展开的合并地块。 */
export const mergeMockLand = (params: MergeLandParams): Promise<ResultData<undefined>> => {
	const selectedIds = params.landOrList.map(item => item.landId);
	const selected = mockLands.filter(land => selectedIds.includes(land.id));
	if (selected.length !== selectedIds.length) return Promise.reject(new Error("待合并地块不存在"));
	const mergeId = `merge-${Date.now()}`;
	const firstLand = selected[0];
	const mergedLand: LandRecord = {
		...clone(firstLand),
		id: mergeId,
		type: "1",
		landName: params.mergeLandName,
		acreageNum: params.mergeAcreageNum,
		actualAcreNum: params.mergeAcreageNum,
		url: params.url,
		gpsList: params.list.map((point, index) => ({ ...point, landId: mergeId, sort: index + 1 })),
		landList: selected.map(land => ({ ...clone(land), type: "2" })),
		landContract: null,
		quitStatus: "0"
	};
	mockLands = [...mockLands.filter(land => !selectedIds.includes(land.id)), mergedLand];
	return success(undefined);
};

/** 修改合并地块的显示名称。 */
export const editMockMergedLand = (id: string, mergeLandName: string): Promise<ResultData<undefined>> => {
	const land = mockLands.find(item => item.id === id && item.type === "1");
	if (!land) return Promise.reject(new Error("未找到合并地块"));
	land.landName = mergeLandName;
	return success(undefined);
};

/** 更新指定地块的所属账号。 */
export const transferMockLand = (mobile: string, list: TransferLandItem[]): Promise<ResultData<undefined>> => {
	list.forEach(item => {
		const land = findLand(item.landId);
		if (land) land.mobile = mobile;
	});
	return success(undefined);
};

/** 将指定地块切换为退地状态。 */
export const quitMockLand = (id: string): Promise<ResultData<undefined>> => {
	const land = findLand(id);
	if (!land) return Promise.reject(new Error("未找到地块"));
	land.quitStatus = "1";
	land.createTime = new Date().toISOString().replace("T", " ").slice(0, 19);
	return success(undefined);
};

/** 恢复指定地块的正常使用状态。 */
export const regainMockLand = (id: string): Promise<ResultData<undefined>> => {
	const land = findLand(id);
	if (!land) return Promise.reject(new Error("未找到地块"));
	land.quitStatus = "0";
	return success(undefined);
};

/** 应用基础信息编辑结果，同时保留坐标字段的地约命名差异。 */
export const editMockLand = (params: LandEditForm): Promise<ResultData<undefined>> => {
	if (!params.id) return Promise.reject(new Error("缺少地块 ID"));
	const land = findLand(params.id);
	if (!land) return Promise.reject(new Error("未找到地块"));
	const fields = { ...params };
	delete fields.id;
	delete fields.landGps;
	Object.assign(land, fields);
	if (params.landGps) land.gpsList = clone(params.landGps);
	return success(undefined);
};

/** 永久删除顶层地块或合并地块中的子地块。 */
export const deleteMockLand = (ids: string[]): Promise<ResultData<undefined>> => {
	mockLands = mockLands
		.filter(land => !ids.includes(land.id))
		.map(land => ({ ...land, landList: land.landList?.filter(child => !ids.includes(child.id)) }));
	return success(undefined);
};

/** 把一个子地块从合并地块移回正常列表。 */
export const removeMockMergedLand = (parentId: string, landId: string): Promise<ResultData<undefined>> => {
	const parent = mockLands.find(land => land.id === parentId);
	const child = parent?.landList?.find(land => land.id === landId);
	if (!parent || !child) return Promise.reject(new Error("未找到合并子地块"));
	parent.landList = parent.landList?.filter(land => land.id !== landId);
	parent.actualAcreNum = Number((parent.actualAcreNum - child.actualAcreNum).toFixed(2));
	parent.acreageNum = Number(
		((parent.acreageNum || parent.actualAcreNum) - (child.acreageNum || child.actualAcreNum)).toFixed(2)
	);
	mockLands = [...mockLands, { ...clone(child), type: "2" }];
	return success(undefined);
};

/** 判断行政村记录是否符合管理页的搜索、状态和时间条件。 */
const matchesVillageFilters = (village: VillageRecord, params: VillageListParams) => {
	if (!includesFilter(village.deptName, params.deptName) || !includesFilter(village.name, params.name)) return false;
	if (!includesFilter(village.createBy, params.createBy) || (params.status && village.status !== params.status)) return false;
	const createDate = village.createTime?.slice(0, 10) || "";
	if (params.beginTime && createDate < params.beginTime) return false;
	return !(params.endsTime && createDate > params.endsTime);
};

/** 返回支持筛选和分页的本地行政村管理数据。 */
export const getMockVillageList = (params: VillageListParams = {}): Promise<ResultData<LandPage<VillageRecord>>> => {
	const matchedRows = mockVillages.filter(village => matchesVillageFilters(village, params));
	const pageNum = Math.max(1, params.pageNum || 1);
	const pageSize = Math.max(1, params.pageSize || matchedRows.length || 10);
	const start = (pageNum - 1) * pageSize;
	return success({ rows: clone(matchedRows.slice(start, start + pageSize)), total: matchedRows.length, pageNum, pageSize });
};

/** 获取单条行政村的本地详情。 */
export const getMockVillageDetail = (id: string): Promise<ResultData<VillageRecord>> => {
	const village = mockVillages.find(item => item.id === id);
	if (!village) return Promise.reject(new Error("未找到行政村"));
	return success(clone(village));
};

/** 新增行政村，并阻止同一创建单位下出现重复名称。 */
export const addMockVillage = (params: VillageForm): Promise<ResultData<undefined>> => {
	const name = params.name.trim();
	if (mockVillages.some(village => village.name === name)) return Promise.reject(new Error("行政村名称已存在"));
	const now = new Date().toISOString().replace("T", " ").slice(0, 19);
	mockVillages = [
		{
			id: `village-${Date.now()}`,
			name,
			status: params.status,
			deptName: "东亭镇",
			createBy: "本地演示账号",
			createTime: now
		},
		...mockVillages
	];
	return success(undefined);
};

/** 修改行政村名称和状态，同时同步关联的本地地块名称。 */
export const editMockVillage = (params: VillageForm): Promise<ResultData<undefined>> => {
	if (!params.id) return Promise.reject(new Error("缺少行政村 ID"));
	const village = mockVillages.find(item => item.id === params.id);
	if (!village) return Promise.reject(new Error("未找到行政村"));
	const name = params.name.trim();
	if (mockVillages.some(item => item.id !== params.id && item.name === name))
		return Promise.reject(new Error("行政村名称已存在"));
	const previousName = village.name;
	village.name = name;
	village.status = params.status;
	mockLands.forEach(land => {
		if (land.administrativeVillage === previousName) land.administrativeVillage = name;
		land.landList?.forEach(child => {
			if (child.administrativeVillage === previousName) child.administrativeVillage = name;
		});
	});
	return success(undefined);
};

/** 批量更新行政村启用状态。 */
export const editMockVillageStatus = (ids: string[], status: "0" | "1"): Promise<ResultData<undefined>> => {
	mockVillages.forEach(village => {
		if (ids.includes(village.id)) village.status = status;
	});
	return success(undefined);
};

/** 删除选中的本地行政村记录。 */
export const deleteMockVillages = (ids: string[]): Promise<ResultData<undefined>> => {
	mockVillages = mockVillages.filter(village => !ids.includes(village.id));
	return success(undefined);
};

/** 新增或覆盖土地合同，并补齐详情页需要的合同字段。 */
const saveMockContract = (params: LandContractForm, create = false): Promise<ResultData<undefined>> => {
	if (!params.landId) return Promise.reject(new Error("缺少地块 ID"));
	const land = findLand(params.landId);
	if (!land) return Promise.reject(new Error("未找到地块"));
	land.landContract = {
		...clone(params),
		id: params.id || `contract-${Date.now()}`,
		contractNo: params.contractNo || `DY-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
		createName: params.createName || (create ? "本地演示账号" : land.landContract?.createName || "本地演示账号")
	};
	return success(undefined);
};

/** 新增本地土地合同。 */
export const addMockLandContract = (params: LandContractForm): Promise<ResultData<undefined>> => saveMockContract(params, true);

/** 更新本地土地合同。 */
export const editMockLandContract = (params: LandContractForm): Promise<ResultData<undefined>> => saveMockContract(params);

/** 返回模拟截图文件信息，不读取或上传真实文件。 */
export const uploadMockLandSnapshot = (file: File): Promise<ResultData<UploadedFile>> => {
	void file;
	return success({ fileName: `mock-land-snapshot-${Date.now()}.png`, url: "" });
};

/** 返回与地约逆地理编码结构兼容的模拟地址。 */
export const getMockLandAddress = (): Promise<LandAddress> =>
	Promise.resolve({
		formatted_address: "河北省保定市定州市东亭镇北王村",
		addressComponent: { country: "中国", province: "河北省", city: "保定市", district: "定州市", township: "东亭镇" }
	});
