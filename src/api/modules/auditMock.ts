import type { AuditCensus, AuditForm, AuditListParams, AuditPage, AuditRecord, AuditSummary } from "@/api/interface/audit";
import type { ResultData } from "@/api/interface";

/** 创建符合项目请求层结构的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝本地数据，隔离页面表单与 mock 数据源。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 生成 EPSG:4326 的闭合地块边界。 */
const createPolygon = (landId: string, longitude: number, latitude: number) => [
	{ landId, lng: longitude, lat: latitude, sort: 1 },
	{ landId, lng: longitude + 0.007, lat: latitude + 0.001, sort: 2 },
	{ landId, lng: longitude + 0.006, lat: latitude + 0.006, sort: 3 },
	{ landId, lng: longitude - 0.001, lat: latitude + 0.005, sort: 4 },
	{ landId, lng: longitude, lat: latitude, sort: 5 }
];

/** 审核页面可操作的本地地块集合。 */
let mockAudits: AuditRecord[] = [
	{
		id: "audit-1001",
		status: "0",
		landName: "王建国 · 东南地块",
		landType: "1",
		acreageNum: 12.91,
		actualAcreNum: 12.68,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "河北省保定市定州市东亭镇北王村东南侧",
		formattedAddress: "北王村东南侧 1 号田",
		relename: "王建国",
		cardid: "130682198905162013",
		mobile: "13800138011",
		bankAccount: "6217000012345678901",
		openBank: "中国建设银行定州支行",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2025-05-18 09:24:10",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		bankMetaStatus: "1",
		gpsList: createPolygon("audit-1001", 115.013, 38.506)
	},
	{
		id: "audit-1002",
		status: "0",
		landName: "赵秀兰 · 南侧地块",
		landType: "2",
		acreageNum: 18.25,
		actualAcreNum: 18,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "河北省保定市定州市东亭镇北王村南侧",
		relename: "赵秀兰",
		cardid: "130682197707184821",
		mobile: "13800138012",
		bankAccount: "6217000012345678902",
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2025-05-20 11:08:36",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		bankMetaStatus: "0",
		bankMetaMessage: "银行卡开户信息校验未通过，请核对后再审核",
		gpsList: createPolygon("audit-1002", 115.025, 38.498)
	},
	{
		id: "audit-1003",
		status: "1",
		landName: "刘海燕 · 北侧地块",
		landType: "1",
		acreageNum: 10.62,
		actualAcreNum: 10.4,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "北王村",
		detailaddress: "河北省保定市定州市东亭镇北王村北侧",
		relename: "刘海燕",
		cardid: "130682199206103527",
		mobile: "13800138013",
		bankAccount: "6217000012345678903",
		createName: "李春梅",
		createMobile: "13800138001",
		createTime: "2025-05-12 10:12:28",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		contractNo: "DY-2025-0018",
		contractType: "1",
		termOfLease: 5,
		startTime: "2025-06-10",
		endTime: "2030-06-10",
		perAcreAmount: 820,
		totalAmount: 42640,
		paymentAmount: 8528,
		paymentMethod: "1",
		times: [{ paymentTime: "01-15" }],
		bankMetaStatus: "1",
		gpsList: createPolygon("audit-1003", 115.041, 38.512)
	},
	{
		id: "audit-1004",
		status: "1",
		landName: "陈国强 · 西侧地块",
		landType: "2",
		acreageNum: 8.43,
		actualAcreNum: 8.2,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "西王村",
		detailaddress: "河北省保定市定州市东亭镇西王村东侧",
		relename: "陈国强",
		cardid: "130682198404206419",
		mobile: "13800138014",
		bankAccount: "6217000012345678904",
		createName: "周志强",
		createMobile: "13800138002",
		createTime: "2025-04-26 14:35:52",
		memberName: "张晓峰",
		memberMobile: "13900139001",
		contractNo: "DY-2025-0012",
		contractType: "2",
		termOfLease: 3,
		startTime: "2025-05-01",
		endTime: "2028-05-01",
		perAcreAmount: 680,
		totalAmount: 16728,
		paymentAmount: 2788,
		paymentMethod: "2",
		times: [{ paymentTime: "05-10" }, { paymentTime: "11-10" }],
		bankMetaStatus: "1",
		gpsList: createPolygon("audit-1004", 115.052, 38.502)
	},
	{
		id: "audit-1005",
		status: "2",
		landName: "孙志明 · 已退地块",
		landType: "1",
		acreageNum: 6.34,
		actualAcreNum: 6.1,
		province: "河北省",
		city: "保定市",
		district: "定州市",
		township: "东亭镇",
		administrativeVillage: "南王村",
		detailaddress: "河北省保定市定州市东亭镇南王村西侧",
		relename: "孙志明",
		cardid: "130682197812262036",
		mobile: "13800138015",
		createName: "刘洋",
		createMobile: "13800138003",
		createTime: "2025-03-19 14:22:08",
		quitTime: "2025-05-02 16:20:11",
		quitByName: "系统管理员",
		quitByPhone: "13800138000",
		bankMetaStatus: "1",
		gpsList: createPolygon("audit-1005", 115.002, 38.492)
	}
];

/** 对可选文本字段执行不区分大小写的包含匹配。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.toLowerCase());

/** 判断审核地块是否符合当前状态与高级筛选条件。 */
const matchesFilters = (record: AuditRecord, params: AuditListParams) => {
	const keywordTarget = [record.landName, record.mobile, record.cardid, record.detailaddress].join(" ");
	if (params.status && record.status !== params.status) return false;
	if (!includesFilter(keywordTarget, params.searchValue)) return false;
	if (!includesFilter(record.cardid, params.cardid) || !includesFilter(record.bankAccount, params.bankAccount)) return false;
	if (!includesFilter(record.relename, params.relename) || !includesFilter(record.mobile, params.mobile)) return false;
	if (!includesFilter(record.createName, params.createName) || !includesFilter(record.memberName, params.areaManager))
		return false;
	if (params.bankMetaStatus && record.bankMetaStatus !== params.bankMetaStatus) return false;
	if (params.province && record.province !== params.province) return false;
	if (params.city && record.city !== params.city) return false;
	if (params.district && record.district !== params.district) return false;
	if (params.township && record.township !== params.township) return false;
	if (params.administrativeVillage && record.administrativeVillage !== params.administrativeVillage) return false;
	if (params.beginActualNum != null && record.actualAcreNum < params.beginActualNum) return false;
	if (params.endActualNum != null && record.actualAcreNum > params.endActualNum) return false;
	const createdDate = record.createTime?.slice(0, 10) || "";
	if (params.beginTime && createdDate < params.beginTime) return false;
	return !(params.endsTime && createdDate > params.endsTime);
};

/** 查询符合条件的审核地块。 */
export const getMockAuditList = (params: AuditListParams): Promise<ResultData<AuditPage>> => {
	const rows = mockAudits.filter(record => matchesFilters(record, params));
	return success({ rows: clone(rows), total: rows.length });
};

/** 查询不受当前筛选影响的审核状态总览。 */
export const getMockAuditCensus = (): Promise<ResultData<AuditCensus>> =>
	success({
		allNum: mockAudits.length,
		unauditedNum: mockAudits.filter(record => record.status === "0").length,
		auditedNum: mockAudits.filter(record => record.status === "1").length,
		quitLandNum: mockAudits.filter(record => record.status === "2").length
	});

/** 查询当前筛选结果的数量和面积。 */
export const getMockAuditSummary = (params: AuditListParams): Promise<ResultData<AuditSummary>> => {
	const records = mockAudits.filter(record => matchesFilters(record, params));
	return success({
		landNum: records.length,
		totalAcreageNum: Number(records.reduce((total, record) => total + record.actualAcreNum, 0).toFixed(2))
	});
};

/** 查询审核地块完整详情。 */
export const getMockAuditDetail = (id: string): Promise<ResultData<AuditRecord>> => {
	const record = mockAudits.find(item => item.id === id);
	return record ? success(clone(record)) : Promise.reject(new Error("未找到审核地块"));
};

/** 保存审核表单并把待审核地块转换为已审核。 */
export const saveMockAudit = (params: AuditForm): Promise<ResultData<null>> => {
	const index = mockAudits.findIndex(record => record.id === params.id);
	if (index < 0) return Promise.reject(new Error("未找到审核地块"));
	mockAudits[index] = {
		...mockAudits[index],
		...clone(params),
		status: "1",
		contractNo: mockAudits[index].contractNo || `DY-MOCK-${String(index + 1).padStart(4, "0")}`
	};
	return success(null);
};

/** 将一个或多个地块标记为已退地。 */
export const quitMockAudit = (ids: string[]): Promise<ResultData<null>> => {
	mockAudits = mockAudits.map(record =>
		ids.includes(record.id) ? { ...record, status: "2", quitTime: "2026-09-05 10:30:00", quitByName: "系统管理员" } : record
	);
	return success(null);
};

/** 将一个或多个已退地块恢复为待审核。 */
export const recoverMockAudit = (ids: string[]): Promise<ResultData<null>> => {
	mockAudits = mockAudits.map(record => (ids.includes(record.id) ? { ...record, status: "0", quitTime: undefined } : record));
	return success(null);
};

/** 永久删除一个或多个审核地块。 */
export const deleteMockAudit = (ids: string[]): Promise<ResultData<null>> => {
	mockAudits = mockAudits.filter(record => !ids.includes(record.id));
	return success(null);
};
