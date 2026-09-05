import type { LandContract, LandGpsPoint } from "@/api/interface/land";

/** 审核页支持的地块业务状态。 */
export type AuditStatus = "" | "0" | "1" | "2";

/** 审核地块列表与详情共用的数据模型。 */
export interface AuditRecord extends LandContract {
	id: string;
	status: Exclude<AuditStatus, "">;
	landName: string;
	landType: "1" | "2";
	acreageNum: number;
	actualAcreNum: number;
	formattedAddress?: string;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	detailaddress?: string;
	relename?: string;
	cardid?: string;
	mobile?: string;
	bankAccount?: string;
	openBank?: string;
	createName?: string;
	createMobile?: string;
	createTime?: string;
	memberName?: string;
	memberMobile?: string;
	quitTime?: string;
	quitByName?: string;
	quitByPhone?: string;
	bankMetaStatus?: "0" | "1";
	bankMetaMessage?: string;
	contractType?: "1" | "2";
	gpsList: LandGpsPoint[];
	url?: string;
}

/** 审核页关键词与高级筛选条件。 */
export interface AuditListParams {
	status?: AuditStatus;
	searchValue?: string;
	cardid?: string;
	bankAccount?: string;
	relename?: string;
	mobile?: string;
	createName?: string;
	areaManager?: string;
	bankMetaStatus?: "0" | "1";
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage?: string;
	beginActualNum?: number;
	endActualNum?: number;
	beginTime?: string;
	endsTime?: string;
}

/** 审核列表接口的分页形状。 */
export interface AuditPage {
	rows: AuditRecord[];
	total: number;
}

/** 审核页各状态标签的数量。 */
export interface AuditCensus {
	allNum: number;
	unauditedNum: number;
	auditedNum: number;
	quitLandNum: number;
}

/** 当前筛选结果的地块数量和面积。 */
export interface AuditSummary {
	landNum: number;
	totalAcreageNum: number;
}

/** 完成审核或编辑审核信息时提交的合同字段。 */
export interface AuditForm {
	id: string;
	landName: string;
	mobile: string;
	cardid: string;
	bankAccount?: string;
	actualAcreNum: number;
	province?: string;
	city?: string;
	district?: string;
	township?: string;
	administrativeVillage: string;
	detailaddress?: string;
	contractType: "1" | "2";
	termOfLease: number;
	startTime: string;
	endTime: string;
	perAcreAmount: number;
	paymentMethod: "1" | "2" | "3";
	paymentAmount: number;
	totalAmount: number;
	times: Array<{ paymentTime: string }>;
}
