# Vue-to-React Mapping

Use this as a translation guide, not a mechanical replacement table.

| Vue source | React target |
| --- | --- |
| Vue 3 SFC | React function component in .tsx |
| Element Plus | Ant Design 4 |
| Pinia | Existing Redux modules or component-local state |
| Vue Router 4 | React Router 6 route modules |
| ref / reactive | useState or useRef |
| computed | Derived value or useMemo when needed |
| watch / watchEffect | useEffect with explicit dependencies |
| onMounted / onUnmounted | useEffect setup and cleanup |
| defineProps | Typed component props |
| defineEmits | Typed callback props |
| slots | children, render props, or explicit props |
| v-model | Controlled value plus change callback |
| el-form | Ant Design Form |
| el-table | Ant Design Table with typed columns |
| el-dialog | Ant Design Modal |
| el-drawer | Ant Design Drawer |
| ElMessage | Ant Design message |
| scoped SCSS | Colocated Less |

## Source inspection order

1. src/views/<domain>/
2. Imported components and composables
3. src/api/modules/<domain>.ts
4. src/api/interface/<domain>.ts
5. Relevant router and Pinia store files
6. Imported assets and styles

Preserve API behavior but correct obvious local typing or naming defects. Do not silently change endpoints or business rules; record necessary deviations.
