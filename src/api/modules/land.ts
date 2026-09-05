import http from "@/api";
import type {
	LandAddress,
	LandCensus,
	LandContractForm,
	LandEditForm,
	LandListParams,
	LandPage,
	LandRecord,
	LandReference,
	MergeLandParams,
	TransferLandItem,
	UploadedFile,
	VillageForm,
	VillageListParams,
	VillageRecord
} from "@/api/interface/land";
import {
	addMockLandContract,
	addMockVillage,
	deleteMockLand,
	deleteMockVillages,
	downloadMockLandExport,
	editMockLand,
	editMockLandContract,
	editMockMergedLand,
	editMockVillage,
	editMockVillageStatus,
	exportMockLandList,
	getMockLandAddress,
	getMockLandCensus,
	getMockLandDetail,
	getMockLandList,
	getMockVillageDetail,
	getMockVillageList,
	mergeMockLand,
	quitMockLand,
	regainMockLand,
	removeMockMergedLand,
	transferMockLand,
	uploadMockLandSnapshot
} from "./landMock";

/** 判断土地管理是否使用本地地约风格模拟数据。 */
export const isMockLandEnabled = import.meta.env.VITE_USE_MOCK_LAND !== "false";

/** 查询正常或已退土地列表。 */
export const getLandList = (params: LandListParams) =>
	isMockLandEnabled ? getMockLandList(params) : http.get<LandPage<LandRecord>>("/diyue/land/list", params);

/** 查询指定退地状态下的土地统计。 */
export const getLandCensus = (params: Pick<LandListParams, "quitStatus">) =>
	isMockLandEnabled ? getMockLandCensus(params.quitStatus) : http.get<LandCensus>("/diyue/land/landCount", params);

/** 查询单个地块的基础信息和合同信息。 */
export const getLandDetail = (id: string) =>
	isMockLandEnabled ? getMockLandDetail(id) : http.get<LandRecord>(`/diyue/land/${id}`);

/** 触发后端生成土地列表导出文件。 */
export const exportLandList = (params: LandListParams) =>
	isMockLandEnabled ? exportMockLandList(params) : http.get<string>("/diyue/land/export", params);

/** 新增一条合并地块。 */
export const mergeLand = (params: MergeLandParams) =>
	isMockLandEnabled ? mergeMockLand(params) : http.post("/diyue/mergeLand", params);

/** 修改合并地块的名称等聚合信息。 */
export const editMergedLand = (params: { id: string; mergeLandName: string }) =>
	isMockLandEnabled ? editMockMergedLand(params.id, params.mergeLandName) : http.put("/diyue/mergeLand", params);

/** 将一个或多个地块转移到指定账号。 */
export const transferLand = (params: { list: TransferLandItem[]; mobile: string }) =>
	isMockLandEnabled ? transferMockLand(params.mobile, params.list) : http.put("/diyue/land/shiftLand", params);

/** 将地块标记为退地。 */
export const quitLand = (params: { id: string }) =>
	isMockLandEnabled ? quitMockLand(params.id) : http.put("/diyue/land/quitLand", params);

/** 恢复已退地块。 */
export const regainLand = (params: { id: string }) =>
	isMockLandEnabled ? regainMockLand(params.id) : http.put("/diyue/land/regainLand", params);

/** 修改单个地块的基础信息。 */
export const editLand = (params: LandEditForm) => (isMockLandEnabled ? editMockLand(params) : http.put("/diyue/land", params));

/** 永久删除一个或多个地块。 */
export const deleteLand = (ids: string[]) =>
	isMockLandEnabled ? deleteMockLand(ids) : http.delete(`/diyue/land/${ids.join(",")}`);

/** 将子地块移出当前合并地块。 */
export const removeMergedLand = (params: { id: string; landOrList: LandReference[] }) =>
	isMockLandEnabled
		? removeMockMergedLand(params.id, params.landOrList[0]?.landId || "")
		: http.put("/diyue/mergeLand/removeMergeLand", params);

/** 查询行政村下拉选项或管理页列表。 */
export const getVillageList = (params: VillageListParams = {}) =>
	isMockLandEnabled
		? getMockVillageList(params)
		: http.get<LandPage<VillageRecord>>("/administrative/DyAdministrativeVillage/list", params);

/** 查询单个行政村详情。 */
export const getVillageDetail = (id: string) =>
	isMockLandEnabled ? getMockVillageDetail(id) : http.get<VillageRecord>(`/administrative/DyAdministrativeVillage/${id}`);

/** 新增行政村。 */
export const addVillage = (params: VillageForm) =>
	isMockLandEnabled ? addMockVillage(params) : http.post("/administrative/DyAdministrativeVillage", params);

/** 编辑行政村名称和状态。 */
export const editVillage = (params: VillageForm) =>
	isMockLandEnabled ? editMockVillage(params) : http.put("/administrative/DyAdministrativeVillage", params);

/** 删除一个或多个行政村。 */
export const deleteVillages = (ids: string[]) =>
	isMockLandEnabled ? deleteMockVillages(ids) : http.delete(`/administrative/DyAdministrativeVillage/${ids.join(",")}`);

/** 批量启用或停用行政村。 */
export const editVillageStatus = (params: { ids: string[]; status: "0" | "1" }) =>
	isMockLandEnabled
		? editMockVillageStatus(params.ids, params.status)
		: http.put("/administrative/DyAdministrativeVillage/editStatus", params);

/** 新增土地合同。 */
export const addLandContract = (params: LandContractForm) =>
	isMockLandEnabled ? addMockLandContract(params) : http.post("/diyue/landContract", params);

/** 修改土地合同。 */
export const editLandContract = (params: LandContractForm) =>
	isMockLandEnabled ? editMockLandContract(params) : http.put("/diyue/landContract", params);

/** 上传合并地块地图快照。 */
export const uploadLandSnapshot = (file: File) => {
	if (isMockLandEnabled) return uploadMockLandSnapshot(file);
	// 使用 multipart/form-data 交由 Axios 自动补齐 boundary。
	const formData = new FormData();
	formData.append("file", file);
	return http.post<UploadedFile>("/common/upload", formData);
};

/** 通过现有后端代理逆地理编码，在 API 边界适配 JSON 字符串响应。 */
export const getLandAddress = async (longitude: number, latitude: number): Promise<LandAddress> => {
	if (isMockLandEnabled) return getMockLandAddress();
	// 兼容源系统的字符串及已解析 JSON 两种包装。
	const response = await http.get<string | { regeocode?: LandAddress }>("/geoLocationToAddress", { longitude, latitude });
	const data: { regeocode?: LandAddress } | undefined =
		typeof response.data === "string" ? JSON.parse(response.data) : response.data;
	if (!data?.regeocode?.addressComponent) throw new Error("地块地址解析失败，请重试");
	return data.regeocode;
};

/** 从同一后端下载导出结果，保留请求层的认证与异常处理。 */
export const downloadLandExport = async (fileName: string): Promise<Blob> => {
	if (isMockLandEnabled) return downloadMockLandExport(fileName);
	// 二进制响应由请求层直接返回 Blob，而不是业务 JSON 包装。
	const response = await http.get<never>("/common/download", { fileName, delete: false }, { responseType: "blob" });
	const blob = response as unknown;
	if (!(blob instanceof Blob) || blob.size === 0) throw new Error("导出文件为空");
	if (blob.type.includes("json")) throw new Error("导出下载失败");
	return blob;
};
