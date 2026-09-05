import http from "@/api";
import type { AuditCensus, AuditForm, AuditListParams, AuditPage, AuditRecord, AuditSummary } from "@/api/interface/audit";
import {
	deleteMockAudit,
	getMockAuditCensus,
	getMockAuditDetail,
	getMockAuditList,
	getMockAuditSummary,
	quitMockAudit,
	recoverMockAudit,
	saveMockAudit
} from "./auditMock";

/** 审核模块是否启用本地 mock，默认与土地模块保持一致。 */
export const isMockAuditEnabled = import.meta.env.VITE_USE_MOCK_LAND !== "false";

/** 查询审核地块列表。 */
export const getAuditList = (params: AuditListParams) =>
	isMockAuditEnabled ? getMockAuditList(params) : http.get<AuditPage>("/diyue/land/auditList", params);

/** 查询审核状态统计。 */
export const getAuditCensus = () => (isMockAuditEnabled ? getMockAuditCensus() : http.get<AuditCensus>("/diyue/land/auditCount"));

/** 查询筛选结果的地块统计。 */
export const getAuditSummary = (params: AuditListParams) =>
	isMockAuditEnabled ? getMockAuditSummary(params) : http.get<AuditSummary>("/diyue/land/auditCountList", params);

/** 查询单个审核地块详情。 */
export const getAuditDetail = (id: string) =>
	isMockAuditEnabled ? getMockAuditDetail(id) : http.get<AuditRecord>(`/diyue/land/queryAuditLandById/${id}`);

/** 新增或编辑合同审核信息。 */
export const saveAudit = (params: AuditForm) =>
	isMockAuditEnabled ? saveMockAudit(params) : http.put("/diyue/land/auditLandContractEdit", params);

/** 批量退地。 */
export const quitAudit = (ids: string[]) =>
	isMockAuditEnabled ? quitMockAudit(ids) : http.put(`/diyue/land/allQuitLand/${ids.join(",")}`);

/** 批量恢复地块。 */
export const recoverAudit = (ids: string[]) =>
	isMockAuditEnabled ? recoverMockAudit(ids) : http.put(`/diyue/land/allRegainLand/${ids.join(",")}`);

/** 批量删除审核地块。 */
export const deleteAudit = (ids: string[]) =>
	isMockAuditEnabled ? deleteMockAudit(ids) : http.delete(`/diyue/land/${ids.join(",")}`);
