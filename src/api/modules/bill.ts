import type { BillDefaultForm, BillListParams, BillSettlementForm } from "@/api/interface/bill";
import {
	createMockDefaultBill,
	downloadMockBillExport,
	exportMockBillList,
	getMockBillDetail,
	getMockBillList,
	revokeMockBillSettlement,
	settleMockBill
} from "./billMock";

/** 查询账单分页列表，当前需求固定使用本地 Mock 数据。 */
export const getBillList = (params: BillListParams) => getMockBillList(params);

/** 查询单条账单详情和打款记录。 */
export const getBillDetail = (id: string) => getMockBillDetail(id);

/** 确认账单结算。 */
export const settleBill = (params: BillSettlementForm) => settleMockBill(params);

/** 撤销账单结算状态。 */
export const revokeBillSettlement = (id: string) => revokeMockBillSettlement(id);

/** 生成违约账单信息。 */
export const createDefaultBill = (params: BillDefaultForm) => createMockDefaultBill(params);

/** 生成当前筛选范围内的账单导出文件。 */
export const exportBillList = (params: BillListParams) => exportMockBillList(params);

/** 下载已生成的账单导出文件。 */
export const downloadBillExport = (fileName: string) => downloadMockBillExport(fileName);
