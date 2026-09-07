import type { ResultData } from "@/api/interface";
import type {
	BillDefaultForm,
	BillListParams,
	BillPage,
	BillPaymentMethod,
	BillRecord,
	BillSettlementForm,
	BillSettlementStatus
} from "@/api/interface/bill";

/** 创建符合项目请求层约定的成功响应。 */
const success = <T>(data: T): Promise<ResultData<T>> => Promise.resolve({ code: 200, msg: "success", data });

/** 深拷贝 Mock 数据，避免页面编辑直接污染数据源。 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Mock 数据使用的农户基础资料。 */
const FARMERS = [
	{ name: "王建国", mobile: "13800138001", cardid: "130682198105162011", bank: "6217000012345678901" },
	{ name: "赵秀兰", mobile: "13800138002", cardid: "130682197803082026", bank: "6217000012345678902" },
	{ name: "刘海燕", mobile: "13800138003", cardid: "130682198906202038", bank: "6217000012345678903" },
	{ name: "陈国强", mobile: "13800138004", cardid: "130682197512142041", bank: "6217000012345678904" },
	{ name: "孙志明", mobile: "13800138005", cardid: "130682198307252059", bank: "6217000012345678905" },
	{ name: "周桂芳", mobile: "13800138006", cardid: "130682197909112062", bank: "6217000012345678906" }
] as const;

/** 付款方式对应的展示渠道。 */
const PAYMENT_CHANNELS: Record<BillPaymentMethod, string> = {
	bank: "中国建设银行银企直联",
	cash: "线下现金",
	other: "线下转账"
};

/** 构造单条账单 Mock 数据。 */
const createBill = (id: number, settlementStatus: BillSettlementStatus, overrides: Partial<BillRecord> = {}): BillRecord => {
	// 按序循环取用农户资料，确保列表中同一合同资料一致。
	const farmer = FARMERS[(id - 1) % FARMERS.length];
	// 已结算账单预置一条成功付款记录。
	const settled = settlementStatus === "settled";
	// 生成各状态可直观看出差异的应付日期。
	const dueDates = ["2026-03-15", "2026-05-10", "2026-07-15", "2026-09-20", "2026-11-10", "2027-01-15"];
	// 当前账单的应付金额。
	const amount = Number((6200 + id * 835.5).toFixed(2));
	// 当前账单默认使用的支付方式。
	const paymentMethod: BillPaymentMethod = id % 3 === 0 ? "other" : "bank";

	return {
		id: `bill-${String(id).padStart(4, "0")}`,
		billNo: `ZD-2026-${String(id).padStart(5, "0")}`,
		contractNo: `DY-2025-${String(((id - 1) % 8) + 1).padStart(4, "0")}`,
		period: `第 ${((id - 1) % 3) + 1} 期`,
		farmerName: farmer.name,
		mobile: farmer.mobile,
		cardid: farmer.cardid,
		bankAccount: farmer.bank,
		openBank: "中国建设银行定州支行",
		dueDate: dueDates[(id - 1) % dueDates.length],
		amount,
		settlementStatus,
		defaultStatus: "normal",
		paymentMethod: settled ? paymentMethod : undefined,
		paidAt: settled ? `2026-0${Math.min(id, 9)}-${String(8 + id).padStart(2, "0")} 14:20:00` : undefined,
		paymentChannel: settled ? PAYMENT_CHANNELS[paymentMethod] : undefined,
		payer: settled ? "财务管理员" : undefined,
		createName: id % 2 ? "李春梅" : "周志强",
		createTime: `2026-0${Math.min(((id - 1) % 8) + 1, 9)}-${String(5 + id).padStart(2, "0")} 09:30:00`,
		remark: id === 5 ? "农户申请付款前电话确认" : undefined,
		paymentRecords: settled
			? [
					{
						id: `payment-${id}-1`,
						paidAt: `2026-0${Math.min(id, 9)}-${String(8 + id).padStart(2, "0")} 14:20:00`,
						method: paymentMethod,
						channel: PAYMENT_CHANNELS[paymentMethod],
						operator: "财务管理员",
						result: "success"
					}
			  ]
			: [],
		...overrides
	};
};

/** 支持筛选、结算和违约处理的账单本地数据源。 */
let mockBills: BillRecord[] = [
	createBill(1, "pending"),
	createBill(2, "pending"),
	createBill(3, "pending"),
	createBill(4, "settled"),
	createBill(5, "settled"),
	createBill(6, "settled"),
	createBill(7, "overdue", {
		defaultStatus: "default",
		defaultAmount: 1200,
		defaultReason: "土地征收",
		defaultRemark: "第一季作物已种植，款项尚未完成支付",
		paymentRecords: [
			{
				id: "payment-7-1",
				paidAt: "2026-07-18 10:25:00",
				method: "bank",
				channel: PAYMENT_CHANNELS.bank,
				operator: "财务管理员",
				result: "failed",
				failureReason: "收款银行卡状态异常"
			}
		]
	}),
	createBill(8, "overdue"),
	createBill(9, "overdue", {
		defaultStatus: "default",
		defaultAmount: 950,
		defaultReason: "农户提前收回土地",
		defaultRemark: "合同提前终止，按约定生成违约账单"
	}),
	createBill(10, "cancelled", { remark: "关联合同已作废" }),
	createBill(11, "pending"),
	createBill(12, "settled")
];

/** 暂存账单列表导出的 CSV 文件内容。 */
const mockExports = new Map<string, Blob>();

/** 判断文本字段是否满足模糊筛选条件。 */
const includesFilter = (source: string | undefined, expected: string | undefined) =>
	!expected ||
	String(source || "")
		.toLowerCase()
		.includes(expected.toLowerCase());

/** 判断账单是否满足全部列表筛选条件。 */
const matchesFilters = (record: BillRecord, params: BillListParams) => {
	if (params.settlementStatus && record.settlementStatus !== params.settlementStatus) return false;
	if (!includesFilter(record.billNo, params.billNo) || !includesFilter(record.contractNo, params.contractNo)) return false;
	if (!includesFilter(record.farmerName, params.farmerName) || !includesFilter(record.mobile, params.mobile)) return false;
	if (!includesFilter(record.bankAccount, params.bankAccount)) return false;
	if (params.paymentMethod && record.paymentMethod !== params.paymentMethod) return false;
	if (params.beginAmount != null && record.amount < Number(params.beginAmount)) return false;
	if (params.endAmount != null && record.amount > Number(params.endAmount)) return false;
	if (params.beginDueDate && record.dueDate < params.beginDueDate) return false;
	if (params.endDueDate && record.dueDate > params.endDueDate) return false;
	// 创建时间筛选仅比较日期部分。
	const createDate = record.createTime.slice(0, 10);
	if (params.beginCreateTime && createDate < params.beginCreateTime) return false;
	return !(params.endCreateTime && createDate > params.endCreateTime);
};

/** 查询筛选、排序和分页后的账单列表。 */
export const getMockBillList = (params: BillListParams): Promise<ResultData<BillPage>> => {
	// 规范分页参数，避免传入零值导致空分页。
	const pageNum = params.pageNum || 1;
	const pageSize = params.pageSize || 10;
	// 先筛选并按应付日期倒序排列账单。
	const records = mockBills
		.filter(record => matchesFilters(record, params))
		.sort((left, right) => right.dueDate.localeCompare(left.dueDate));
	// 计算当前分页起始位置。
	const start = (pageNum - 1) * pageSize;
	return success({ rows: clone(records.slice(start, start + pageSize)), total: records.length, pageNum, pageSize });
};

/** 查询单条账单的完整信息和打款记录。 */
export const getMockBillDetail = (id: string): Promise<ResultData<BillRecord>> => {
	// 定位需要展示的账单。
	const record = mockBills.find(item => item.id === id);
	return record ? success(clone(record)) : Promise.reject(new Error("未找到账单"));
};

/** 确认账单结算并追加成功打款记录。 */
export const settleMockBill = (params: BillSettlementForm): Promise<ResultData<null>> => {
	// 定位需要结算的账单。
	const record = mockBills.find(item => item.id === params.id);
	if (!record) return Promise.reject(new Error("未找到账单"));
	if (record.settlementStatus === "cancelled") return Promise.reject(new Error("已取消账单不能结算"));

	record.settlementStatus = "settled";
	record.paymentMethod = params.paymentMethod;
	record.paidAt = params.paidAt;
	record.paymentChannel = params.paymentChannel;
	record.payer = params.payer;
	record.remark = params.remark || record.remark;
	record.paymentRecords.unshift({
		id: `payment-${Date.now()}`,
		paidAt: params.paidAt,
		method: params.paymentMethod,
		channel: params.paymentChannel,
		operator: params.payer,
		result: "success"
	});
	return success(null);
};

/** 撤销已结算状态并保留原打款流水。 */
export const revokeMockBillSettlement = (id: string): Promise<ResultData<null>> => {
	// 定位需要撤销结算的账单。
	const record = mockBills.find(item => item.id === id);
	if (!record) return Promise.reject(new Error("未找到账单"));
	if (record.settlementStatus !== "settled") return Promise.reject(new Error("当前账单未结算"));

	// 依据演示基准日期恢复为待结算或已逾期状态。
	record.settlementStatus = record.dueDate < "2026-09-07" ? "overdue" : "pending";
	record.paymentMethod = undefined;
	record.paidAt = undefined;
	record.paymentChannel = undefined;
	record.payer = undefined;
	return success(null);
};

/** 为未结算账单生成违约信息。 */
export const createMockDefaultBill = (params: BillDefaultForm): Promise<ResultData<null>> => {
	// 定位需要生成违约信息的账单。
	const record = mockBills.find(item => item.id === params.id);
	if (!record) return Promise.reject(new Error("未找到账单"));
	if (record.settlementStatus === "settled" || record.settlementStatus === "cancelled") {
		return Promise.reject(new Error("当前账单不能生成违约账单"));
	}

	record.defaultStatus = "default";
	record.defaultAmount = Number(Math.max(100, record.amount * 0.1).toFixed(2));
	record.defaultReason = params.defaultReason;
	record.defaultRemark = [params.processingMethod, params.defaultRemark].filter(Boolean).join("；");
	return success(null);
};

/** 生成当前筛选结果的账单 CSV 文件。 */
export const exportMockBillList = (params: BillListParams): Promise<ResultData<string>> => {
	// 获取导出范围内的全部匹配账单。
	const records = mockBills.filter(record => matchesFilters(record, params));
	// 定义中文 CSV 表头。
	const header = "账单编号,合同编号,账单期数,农户姓名,手机号码,最晚付款时间,付款金额,结算状态,违约状态";
	// 把每条账单转换为 CSV 行。
	const rows = records.map(record =>
		[
			record.billNo,
			record.contractNo,
			record.period,
			record.farmerName,
			record.mobile,
			record.dueDate,
			record.amount,
			record.settlementStatus,
			record.defaultStatus
		].join(",")
	);
	// 使用唯一文件名暂存导出内容。
	const fileName = `mock-bill-${Date.now()}.csv`;
	mockExports.set(fileName, new Blob(["\uFEFF", header, "\n", rows.join("\n")], { type: "text/csv;charset=utf-8" }));
	return success(fileName);
};

/** 下载先前生成的账单列表 CSV 文件。 */
export const downloadMockBillExport = (fileName: string): Promise<Blob> => {
	// 读取内存中的导出文件。
	const file = mockExports.get(fileName);
	return file ? Promise.resolve(file) : Promise.reject(new Error("导出文件不存在"));
};
