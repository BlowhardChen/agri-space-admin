import { defineConfig, loadEnv, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { wrapperEnv } from "./src/utils/getEnv";
import { createHtmlPlugin } from "vite-plugin-html";
import viteCompression from "vite-plugin-compression";
import eslintPlugin from "vite-plugin-eslint";

// @see: https://vitejs.dev/config/
export default defineConfig(
	/* 根据当前运行模式生成 Vite 配置。 */ ({ mode }: ConfigEnv) => {
		// 读取当前运行模式的环境变量。
		const env = loadEnv(mode, process.cwd());
		// 将原始环境变量转换为 Vite 配置值。
		const viteEnv = wrapperEnv(env);

		return {
			// base: "/",
			// alias config
			resolve: {
				alias: {
					"@": resolve(__dirname, "./src")
				}
			},
			// global css
			css: {
				preprocessorOptions: {
					less: {
						// modifyVars: {
						// 	"primary-color": "#1DA57A",
						// },
						javascriptEnabled: true,
						additionalData: `@import "@/styles/var.less";`
					}
				}
			},
			// server config
			server: {
				host: "0.0.0.0", // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
				port: viteEnv.VITE_PORT,
				open: viteEnv.VITE_OPEN,
				cors: true,
				// https: false,
				// 将开发环境请求代理到地约正式服，避免浏览器跨域限制。
				proxy: {
					"/api": {
						// 允许部署环境通过变量覆盖正式服地址。
						target: env.VITE_API_PROXY_TARGET || "http://admin.xtnf.com/web",
						changeOrigin: true,
						rewrite: /* 转发请求前移除统一的 /api 前缀。 */ (path: string) => path.replace(/^\/api/, "")
					}
				}
			},
			// plugins
			plugins: [
				react(),
				createHtmlPlugin({
					inject: {
						data: {
							title: viteEnv.VITE_GLOB_APP_TITLE
						}
					}
				}),
				// * EsLint 报错信息显示在浏览器界面上
				eslintPlugin(),
				// * gzip compress
				viteEnv.VITE_BUILD_GZIP &&
					viteCompression({
						verbose: true,
						disable: false,
						threshold: 10240,
						algorithm: "gzip",
						ext: ".gz"
					})
			],
			// build configure
			build: {
				outDir: "dist",
				// 使用 oxc 作为默认构建工具
				minify: "oxc" as const,
				// terserOptions: {
				// 	compress: {
				// 		drop_console: viteEnv.VITE_DROP_CONSOLE,
				// 		drop_debugger: true
				// 	}
				// },
				rollupOptions: {
					output: {
						// Static resource classification and packaging
						chunkFileNames: "assets/js/[name]-[hash].js",
						entryFileNames: "assets/js/[name]-[hash].js",
						assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
					}
				}
			}
		};
	}
);
