import type { FarmAssignmentForm, FarmLandListParams, FarmTaskForm, FarmTaskListParams } from "@/api/interface/farmMap";
import {
	addMockFarmTask,
	assignMockFarmTask,
	downloadMockFarmTaskExport,
	editMockFarmTask,
	exportMockFarmTaskList,
	getMockFarmAreaCount,
	getMockFarmFormOptions,
	getMockFarmLands,
	getMockFarmStatusCount,
	getMockFarmTaskDetail,
	getMockFarmTaskList,
	getMockFarmTrajectories
} from "./farmMapMock";

/** 查询农事地图任务列表，当前需求固定使用 Mock 数据。 */
export const getFarmTaskList = (params: FarmTaskListParams) => getMockFarmTaskList(params);

/** 查询农事任务状态统计。 */
export const getFarmStatusCount = (params: FarmTaskListParams) => getMockFarmStatusCount(params);

/** 查询农事任务面积统计。 */
export const getFarmAreaCount = (params: FarmTaskListParams) => getMockFarmAreaCount(params);

/** 查询农事任务详情。 */
export const getFarmTaskDetail = (farmingId: string) => getMockFarmTaskDetail(farmingId);

/** 查询农事任务作业轨迹。 */
export const getFarmTrajectories = (farmingId: string) => getMockFarmTrajectories(farmingId);

/** 查询农事地图可选择地块。 */
export const getFarmLands = (params: FarmLandListParams) => getMockFarmLands(params);

/** 查询农事编辑器基础选项。 */
export const getFarmFormOptions = () => getMockFarmFormOptions();

/** 新增农事任务。 */
export const addFarmTask = (params: FarmTaskForm) => addMockFarmTask(params);

/** 编辑农事任务。 */
export const editFarmTask = (params: FarmTaskForm) => editMockFarmTask(params);

/** 分配农事地块和所属账号。 */
export const assignFarmTask = (params: FarmAssignmentForm) => assignMockFarmTask(params);

/** 生成农事列表导出文件。 */
export const exportFarmTaskList = (params: FarmTaskListParams) => exportMockFarmTaskList(params);

/** 下载已生成的农事列表。 */
export const downloadFarmTaskExport = (fileName: string) => downloadMockFarmTaskExport(fileName);
