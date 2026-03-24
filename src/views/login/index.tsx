import React from "react";
import {Form, Input, Button, Card, message} from "antd";
import {UserOutlined, LockOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: Record<string, string>) => {
    console.log("Success:", values);
    // 模拟登录成功
    message.success("登录成功");
    navigate("/");
  };

  const onFinishFailed = (errorInfo: {
    errorFields: Array<{name: string[]; errors: string[]}>;
    values: Record<string, string>;
  }) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card title="登录" style={{width: 400}}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{remember: true}}
        >
          <Form.Item
            name="username"
            rules={[{required: true, message: "请输入用户名!"}]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{required: true, message: "请输入密码!"}]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{width: "100%"}}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
