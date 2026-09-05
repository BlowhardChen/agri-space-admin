import type { LandGpsPoint } from "@/api/interface/land";

/** 合同当前生效阶段。 */
export type ContractValidStatus = "1" | "2" | "3" | "4";

/** 合同付款频次。 */
export type ContractPaymentMethod = "1" | "2" | "3";

/** 合同管理列表、详情和编辑共用的数据模型。 */
export interface ContractRecord {
	id: string;
	landId: string;
	contractNo: string;
	relename: string;
	mobile: string;
	cardid: string;
	bankAccount?: string;
	openBank?: string;
	tenantryName: string;
	tenantryMobile: string;
	tenantryAddress: string;
	actualAcreNum: number;
	acreageNum: number;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress: string;
	contractType: "1" | "2";
	termOfLease: number;
	startTime: string;
	endTime: string;
	perAcreAmount: number;
	totalAmount: number;
	paymentAmount: number;
	paymentMethod: ContractPaymentMethod;
	times: Array<{ paymentTime: string }>;
	validStatus: ContractValidStatus;
	remark?: string;
	createName: string;
	createTime: string;
	updateTime?: string;
	cancellationRemark?: string;
	cancellationTime?: string;
	cancellationBy?: string;
	gpsList?: LandGpsPoint[];
}

/** 合同列表筛选和分页参数。 */
export interface ContractListParams {
	pageNum?: number;
	pageSize?: number;
	validStatus?: ContractValidStatus;
	contractNo?: string;
	relename?: string;
	bankAccount?: string;
	cardid?: string;
	mobile?: string;
	totalAmount?: number;
	beginActualNum?: number;
	endActualNum?: number;
	beginTotalAmount?: number;
	endTotalAmount?: number;
	termOfLease?: number;
	perAcreAmount?: number;
	paymentMethod?: ContractPaymentMethod;
	startTime?: string;
	endTime?: string;
	beginTime?: string;
	endsTime?: string;
	createName?: string;
}

/** 合同分页结果。 */
export interface ContractPage {
	rows: ContractRecord[];
	total: number;
	pageNum: number;
	pageSize: number;
}

/** 合同新增或编辑提交字段。 */
export type ContractForm = Omit<
	ContractRecord,
	| "contractNo"
	| "validStatus"
	| "createName"
	| "createTime"
	| "updateTime"
	| "cancellationRemark"
	| "cancellationTime"
	| "cancellationBy"
>;

/** 作废合同前展示的关联账单。 */
export interface ContractBill {
	id: string;
	period: string;
	dueDate: string;
	amount: number;
	settlementStatus: "待结算" | "已结算";
	defaultStatus: "正常" | "违约";
}
