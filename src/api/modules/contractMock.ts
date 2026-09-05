import type {
	ContractBill,
	ContractForm,
	ContractListParams,
	ContractPage,
	ContractRecord,
	ContractValidStatus
} from "@/api/interface/contract";
import type { ResultData } from "@/api/interface";

/** 创建符合项目请求层规范的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝 mock 数据，避免弹窗编辑污染列表引用。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** 构造合同示例数据的公共字段。 */
const createContract = (
	id: number,
	validStatus: ContractValidStatus,
	overrides: Partial<ContractRecord> = {}
): ContractRecord => ({
	id: `contract-${id}`,
	landId: `land-${id}`,
	contractNo: `DY-2025-${String(id).padStart(4, "0")}`,
	relename: ["王建国", "赵秀兰", "刘海燕", "陈国强", "孙志明", "周桂芳", "李卫东", "高玉兰"][id - 1],
	mobile: `138001380${String(id).padStart(2, "0")}`,
	cardid: `130682198${id}0516201${id}`,
	bankAccount: `62170000123456789${String(id).padStart(2, "0")}`,
	openBank: "中国建设银行定州支行",
	tenantryName: "河北农域农业发展有限公司",
	tenantryMobile: "0312-6666888",
	tenantryAddress: "河北省保定市定州市农业产业园 8 号",
	actualAcreNum: 8 + id * 1.37,
	acreageNum: 8.2 + id * 1.4,
	province: "河北省",
	city: "保定市",
	district: "定州市",
	township: "东亭镇",
	administrativeVillage: id % 2 ? "北王村" : "西王村",
	detailaddress: `河北省保定市定州市东亭镇${id % 2 ? "北王村" : "西王村"}${id}号地块`,
	contractType: id % 3 === 0 ? "2" : "1",
	termOfLease: id % 2 ? 5 : 3,
	startTime: validStatus === "1" ? "2026-10-01" : "2025-01-01",
	endTime: validStatus === "3" ? "2025-06-30" : validStatus === "1" ? "2031-10-01" : "2030-01-01",
	perAcreAmount: 720 + id * 20,
	totalAmount: Number(((8 + id * 1.37) * (id % 2 ? 5 : 3) * (720 + id * 20)).toFixed(2)),
	paymentAmount: Number(((8 + id * 1.37) * (720 + id * 20)).toFixed(2)),
	paymentMethod: id % 3 === 0 ? "3" : id % 2 === 0 ? "2" : "1",
	times:
		id % 3 === 0
			? [{ paymentTime: "03-10" }, { paymentTime: "07-10" }, { paymentTime: "11-10" }]
			: id % 2 === 0
			? [{ paymentTime: "05-10" }, { paymentTime: "11-10" }]
			: [{ paymentTime: "01-15" }],
	validStatus,
	remark: id === 2 ? "优先安排春季付款" : "",
	createName: id % 2 ? "李春梅" : "周志强",
	createTime: `2025-0${Math.min(id, 9)}-${String(8 + id).padStart(2, "0")} 10:20:30`,
	...overrides
});

/** 合同管理可筛选、编辑和作废的本地数据源。 */
let mockContracts: ContractRecord[] = [
	createContract(1, "1"),
	createContract(2, "1"),
	createContract(3, "2"),
	createContract(4, "2"),
	createContract(5, "2"),
	createContract(6, "3"),
	createContract(7, "3"),
	createContract(8, "4", {
		cancellationRemark: "农户提前收回土地",
		cancellationTime: "2025-08-16 15:30:00",
		cancellationBy: "系统管理员"
	})
];

/** 暂存已生成的导出文件内容。 */
const mockExports = new Map<string, Blob>();

/** 判断文本筛选条件是否匹配。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.toLowerCase());

/** 判断合同是否符合列表查询条件。 */
const matchesFilters = (record: ContractRecord, params: ContractListParams) => {
	if (params.validStatus && record.validStatus !== params.validStatus) return false;
	if (!includesFilter(record.contractNo, params.contractNo) || !includesFilter(record.relename, params.relename)) return false;
	if (!includesFilter(record.bankAccount, params.bankAccount) || !includesFilter(record.cardid, params.cardid)) return false;
	if (!includesFilter(record.mobile, params.mobile) || !includesFilter(record.createName, params.createName)) return false;
	if (params.paymentMethod && record.paymentMethod !== params.paymentMethod) return false;
	if (params.totalAmount != null && record.totalAmount !== Number(params.totalAmount)) return false;
	if (params.termOfLease != null && record.termOfLease !== Number(params.termOfLease)) return false;
	if (params.perAcreAmount != null && record.perAcreAmount !== Number(params.perAcreAmount)) return false;
	if (params.beginActualNum != null && record.actualAcreNum < params.beginActualNum) return false;
	if (params.endActualNum != null && record.actualAcreNum > params.endActualNum) return false;
	if (params.beginTotalAmount != null && record.totalAmount < params.beginTotalAmount) return false;
	if (params.endTotalAmount != null && record.totalAmount > params.endTotalAmount) return false;
	if (params.startTime && record.startTime < params.startTime) return false;
	if (params.endTime && record.endTime > params.endTime) return false;
	const createDate = record.createTime.slice(0, 10);
	if (params.beginTime && createDate < params.beginTime) return false;
	return !(params.endsTime && createDate > params.endsTime);
};

/** 查询筛选和分页后的合同列表。 */
export const getMockContractList = (params: ContractListParams): Promise<ResultData<ContractPage>> => {
	const pageNum = params.pageNum || 1;
	const pageSize = params.pageSize || 10;
	const records = mockContracts.filter(record => matchesFilters(record, params));
	const start = (pageNum - 1) * pageSize;
	return success({ rows: clone(records.slice(start, start + pageSize)), total: records.length, pageNum, pageSize });
};

/** 查询单份合同详情。 */
export const getMockContractDetail = (id: string): Promise<ResultData<ContractRecord>> => {
	const record = mockContracts.find(item => item.id === id);
	return record ? success(clone(record)) : Promise.reject(new Error("未找到合同"));
};

/** 保存合同编辑信息。 */
export const editMockContract = (params: ContractForm): Promise<ResultData<null>> => {
	const index = mockContracts.findIndex(record => record.id === params.id);
	if (index < 0) return Promise.reject(new Error("未找到合同"));
	mockContracts[index] = { ...mockContracts[index], ...clone(params), updateTime: "2026-09-05 19:30:00" };
	return success(null);
};

/** 更新合同备注。 */
export const remarkMockContract = (id: string, remark: string): Promise<ResultData<null>> => {
	const record = mockContracts.find(item => item.id === id);
	if (!record) return Promise.reject(new Error("未找到合同"));
	record.remark = remark;
	record.updateTime = "2026-09-05 19:30:00";
	return success(null);
};

/** 作废合同并记录操作信息。 */
export const cancelMockContract = (id: string, reason: string): Promise<ResultData<null>> => {
	const record = mockContracts.find(item => item.id === id);
	if (!record) return Promise.reject(new Error("未找到合同"));
	record.validStatus = "4";
	record.cancellationRemark = reason;
	record.cancellationTime = "2026-09-05 19:30:00";
	record.cancellationBy = "系统管理员";
	return success(null);
};

/** 生成合同关联账单预览。 */
export const getMockContractBills = (record: ContractRecord): Promise<ResultData<ContractBill[]>> =>
	success(
		record.times.map((time, index) => ({
			id: `${record.id}-bill-${index + 1}`,
			period: `第 ${index + 1} 期`,
			dueDate: `${record.startTime.slice(0, 4)}-${time.paymentTime}`,
			amount: record.paymentAmount,
			settlementStatus: index === 0 && record.validStatus === "2" ? "已结算" : "待结算",
			defaultStatus: "正常"
		}))
	);

/** 生成当前筛选结果的 CSV 导出文件。 */
export const exportMockContractList = (params: ContractListParams): Promise<ResultData<string>> => {
	const records = mockContracts.filter(record => matchesFilters(record, params));
	const header = "合同编号,农户姓名,手机号,合同金额,合同期限,付款方式,开始日期,结束日期,状态";
	const rows = records.map(record =>
		[
			record.contractNo,
			record.relename,
			record.mobile,
			record.totalAmount,
			record.termOfLease,
			record.paymentMethod,
			record.startTime,
			record.endTime,
			record.validStatus
		].join(",")
	);
	const fileName = `mock-contract-${Date.now()}.csv`;
	mockExports.set(fileName, new Blob(["\uFEFF", header, "\n", rows.join("\n")], { type: "text/csv;charset=utf-8" }));
	return success(fileName);
};

/** 下载先前生成的合同列表文件。 */
export const downloadMockContractExport = (fileName: string): Promise<Blob> => {
	const file = mockExports.get(fileName);
	return file ? Promise.resolve(file) : Promise.reject(new Error("导出文件不存在"));
};

/** 生成单份合同的可下载文本文件。 */
export const downloadMockContract = (record: ContractRecord): Promise<Blob> =>
	Promise.resolve(
		new Blob(
			[
				`合同编号：${record.contractNo}\n甲方：${record.relename}\n乙方：${record.tenantryName}\n地块：${record.detailaddress}\n面积：${record.actualAcreNum}亩\n有效期：${record.startTime} 至 ${record.endTime}\n合同总金额：${record.totalAmount}元`
			],
			{ type: "text/plain;charset=utf-8" }
		)
	);
