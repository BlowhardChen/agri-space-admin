import {request} from "./request";

// 登录接口
export const loginApi = (data: {username: string; password: string}) => {
  return request.post("/login", data);
};

// 获取用户信息接口
export const getUserInfoApi = () => {
  return request.get("/user/info");
};

// 获取用户列表接口
export const getUserListApi = (params: {page: number; pageSize: number}) => {
  return request.get("/user/list", params);
};

// 添加用户接口
export const addUserApi = (data: Record<string, unknown>) => {
  return request.post("/user/add", data);
};

// 更新用户接口
export const updateUserApi = (data: Record<string, unknown>) => {
  return request.put("/user/update", data);
};

// 删除用户接口
export const deleteUserApi = (id: number) => {
  return request.delete(`/user/delete/${id}`);
};
