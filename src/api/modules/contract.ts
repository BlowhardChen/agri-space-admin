import http from "@/api";
import type { ContractBill, ContractForm, ContractListParams, ContractPage, ContractRecord } from "@/api/interface/contract";
import {
	cancelMockContract,
	downloadMockContract,
	downloadMockContractExport,
	editMockContract,
	exportMockContractList,
	getMockContractBills,
	getMockContractDetail,
	getMockContractList,
	remarkMockContract
} from "./contractMock";

/** 合同模块是否使用本地 mock 数据。 */
export const isMockContractEnabled = import.meta.env.VITE_USE_MOCK_LAND !== "false";

/** 查询合同分页列表。 */
export const getContractList = (params: ContractListParams) =>
	isMockContractEnabled ? getMockContractList(params) : http.get<ContractPage>("/diyue/landContract/list", params);

/** 查询合同详情。 */
export const getContractDetail = (id: string) =>
	isMockContractEnabled ? getMockContractDetail(id) : http.get<ContractRecord>(`/diyue/landContract/${id}`);

/** 保存合同编辑结果。 */
export const editContract = (params: ContractForm) =>
	isMockContractEnabled ? editMockContract(params) : http.put("/diyue/landContract", params);

/** 保存合同备注。 */
export const remarkContract = (id: string, remark: string) =>
	isMockContractEnabled ? remarkMockContract(id, remark) : http.put("/diyue/landContract", { id, landId: id, remark });

/** 作废合同。 */
export const cancelContract = (id: string, reason: string) =>
	isMockContractEnabled
		? cancelMockContract(id, reason)
		: http.put("/diyue/landContract/cancellationLandContract", { id, cancellationRemark: reason });

/** 查询作废确认所需的关联账单。 */
export const getContractBills = (record: ContractRecord) =>
	isMockContractEnabled
		? getMockContractBills(record)
		: Promise.resolve({ code: 200, msg: "success", data: [] as ContractBill[] });

/** 生成合同列表导出文件。 */
export const exportContractList = (params: ContractListParams) => exportMockContractList(params);

/** 下载已生成的合同列表。 */
export const downloadContractExport = (fileName: string) => downloadMockContractExport(fileName);

/** 下载单份合同文本。 */
export const downloadContractFile = (record: ContractRecord) => downloadMockContract(record);
