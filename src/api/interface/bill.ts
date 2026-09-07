/** 账单结算生命周期状态。 */
export type BillSettlementStatus = "pending" | "settled" | "overdue" | "cancelled";

/** 账单列表状态筛选项。 */
export type BillStatusFilter = BillSettlementStatus | "all";

/** 账单付款方式。 */
export type BillPaymentMethod = "bank" | "cash" | "other";

/** 账单关联的违约处理状态。 */
export type BillDefaultStatus = "normal" | "default";

/** 单次账单打款记录。 */
export interface BillPaymentRecord {
	id: string;
	paidAt: string;
	method: BillPaymentMethod;
	channel: string;
	operator: string;
	result: "success" | "failed";
	failureReason?: string;
}

/** 账单列表与详情共用的数据模型。 */
export interface BillRecord {
	id: string;
	billNo: string;
	contractNo: string;
	period: string;
	farmerName: string;
	mobile: string;
	cardid: string;
	bankAccount: string;
	openBank: string;
	dueDate: string;
	amount: number;
	settlementStatus: BillSettlementStatus;
	defaultStatus: BillDefaultStatus;
	paymentMethod?: BillPaymentMethod;
	paidAt?: string;
	paymentChannel?: string;
	payer?: string;
	defaultAmount?: number;
	defaultReason?: string;
	defaultRemark?: string;
	createName: string;
	createTime: string;
	remark?: string;
	paymentRecords: BillPaymentRecord[];
}

/** 账单列表筛选及分页参数。 */
export interface BillListParams {
	pageNum?: number;
	pageSize?: number;
	settlementStatus?: BillSettlementStatus;
	billNo?: string;
	contractNo?: string;
	farmerName?: string;
	mobile?: string;
	bankAccount?: string;
	paymentMethod?: BillPaymentMethod;
	beginAmount?: number;
	endAmount?: number;
	beginDueDate?: string;
	endDueDate?: string;
	beginCreateTime?: string;
	endCreateTime?: string;
}

/** 账单分页查询结果。 */
export interface BillPage {
	rows: BillRecord[];
	total: number;
	pageNum: number;
	pageSize: number;
}

/** 确认账单结算时提交的付款信息。 */
export interface BillSettlementForm {
	id: string;
	paidAt: string;
	paymentMethod: BillPaymentMethod;
	paymentChannel: string;
	payer: string;
	remark?: string;
}

/** 生成违约账单时提交的业务信息。 */
export interface BillDefaultForm {
	id: string;
	defaultReason: string;
	processingMethod: string;
	defaultRemark?: string;
}
