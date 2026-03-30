# 面试官参考答案

> **⚠️ 仅供面试官使用，请勿发送给候选人。**

本文档列出项目中所有植入问题的正确修复方案，以及第二轮面试的参考追问方向。

---

## Bug 1 — RoomRow 运行时崩溃（`getBookingStatus is not a function`）

**文件：** `components/BookingGrid/RoomRow.tsx`

**问题根因：**  
`getBookingStatus` 使用 `const` 箭头函数声明，位于调用它的 `useMemo` **之后**。`const` / `let` 声明不会被提升（hoisting），组件函数体从上到下执行时，进入 `useMemo` 回调时 `getBookingStatus` 尚未赋值，值为 `undefined`，调用即抛出 `TypeError`。

**正确修复：** 将 `getBookingStatus` 定义移到 `useMemo` 之前。

```tsx
// 修复前（错误顺序）
const visibleBookings = useMemo(() => {
  // ...
  const color = getBookingStatus(b.status) // ❌ 此时 getBookingStatus 尚未赋值
  // ...
}, [...])

const getBookingStatus = (status: BookingStatus): string => {
  return STATUS_COLORS[status] ?? '#ccc'
}

// 修复后（正确顺序）
const getBookingStatus = (status: BookingStatus): string => {
  return STATUS_COLORS[status] ?? '#ccc'
}

const visibleBookings = useMemo(() => {
  // ...
  const color = getBookingStatus(b.status) // ✅
  // ...
}, [...])
```

**关键知识点（第二轮追问）：**

- 如果改为 `function getBookingStatus()` 声明，问题会消失吗？为什么？
  - 会。`function` 声明会被完整提升到作用域顶部，包括函数体，因此在声明前调用合法。
- `const` vs `let` vs `function` 的提升行为有何区别？
  - `const`/`let`：声明被提升但不初始化，进入 TDZ（Temporal Dead Zone），访问会抛 `ReferenceError`（此处是 `undefined` 而非 TDZ，是因为它在 `useMemo` 回调函数体内，回调执行时才访问，此时 `const` 已赋值——但如果候选人深挖到此处更好）。
  - `function`：声明+函数体一起提升，可在声明前调用。

---

## Bug 2 — 所有行在 hover 时全部重新渲染

**文件：** `context/AppContext.tsx`、`components/BookingGrid/RoomRow.tsx`

**问题根因（两层）：**

1. `AppContext` 将高频状态 `hoveredCell`（每次鼠标移动都更新）与静态配置 `config` 混在同一个 context。所有订阅该 context 的组件都会在 `hoveredCell` 变化时重新渲染。
2. `RoomRow` 没有 `React.memo` 包裹，props 未变化时也会随父组件重新渲染。

**正确修复：**

**步骤一：** 将 `hoveredCell` 拆分到独立 context。

```tsx
// context/HoverContext.tsx（新建）
import React, { createContext, useContext, useState, ReactNode } from "react";

interface HoveredCell {
  rowId: string;
  dayIndex: number;
}
interface HoverContextValue {
  hoveredCell: HoveredCell | null;
  setHoveredCell: (cell: HoveredCell | null) => void;
}

const HoverContext = createContext<HoverContextValue | null>(null);

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  return (
    <HoverContext.Provider value={{ hoveredCell, setHoveredCell }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHoverContext() {
  const ctx = useContext(HoverContext);
  if (!ctx)
    throw new Error("useHoverContext must be used within HoverProvider");
  return ctx;
}
```

```tsx
// context/AppContext.tsx — 移除 hoveredCell，只保留 config
```

**步骤二：** 用 `React.memo` 包裹 `RoomRow`。

```tsx
export const RoomRow = React.memo(function RoomRow({ ... }: RoomRowProps) {
  // ...
})
```

**步骤三（进阶）：** 如果希望每行只在「自己」被 hover 时才重新渲染，可以在 `RoomRow` 内只订阅 `hoveredCell?.rowId === rowId`，并将 setter 通过稳定引用传递。

**关键知识点（第二轮追问）：**

- `React.memo` 用 `Object.is` 做浅比较。如果父组件传入的 `bookings` 数组每次渲染都是新引用，`React.memo` 无效。如何修复？
  - 父组件用 `useMemo` 稳定 `roomBookings` 引用：`useMemo(() => bookings.filter(...), [bookings, room.id])`
- 如果 `hoveredCell` 需要被 header 行（网格顶部）读取，你的拆分方案还成立吗？
  - 成立，只要 header 也在 `HoverProvider` 内即可。
- 这里有没有用 pub-sub 替代 context 的场景？什么时候 pub-sub 更合适？

---

## Bug 3 — Message页面功能缺失点击ticket后，会减少消息未读的标识和数量

**文件：** `pages/messages/index.tsx`

**问题根因：**  
缺少这部分的逻辑，可以让候选人补齐

**正确修复：**

需要在点击某一个ticket时去增加未读状态的处理

```tsx
const handleTicketClick = (ticket: Ticket) => {
  router.push(`/messages?ticketId=${ticket.id}&houseId=${ticket.houseId}`);
  // 此处需要增加处理未读状态的代码的入口
};
```

---

## Bug 4 — 每次点击工单都触发 `/_next/data/messages.json` 重新请求

**文件：** `pages/_app.tsx`、`context/MessagesContext.tsx`、`pages/messages/index.tsx`

**问题根因（两层，都需要修复）：**

**根因 A — `router.query` 整体作为 `useEffect` 依赖：**  
`router.query` 是对象，每次路由变化 Next.js 都会生成新引用，即使查询参数的值未变化，`Object.is` 比较也会判定为「变化」，effect 重新执行，触发 context state 更新，引发整条渲染树的 re-render。

**根因 B — `MessagesProvider` 挂载在 `_app.tsx` 根层：**  
`getServerSideProps` 的数据刷新是由 Next.js 在路由切换时触发的。当 `MessagesProvider` 的 state 更新导致 re-render 链传播到页面级组件时，Next.js 会重新请求 `/_next/data/` 数据。如果 provider 只包裹 `/messages` 页面，则其他页面完全不受影响。

**正确修复：**

**修复 A — 精确依赖项 + identity guard（`MessagesContext.tsx`）：**

```tsx
// 修复前
useEffect(() => {
  const houseId = router.query.houseId as string;
  const ticketId = router.query.ticketId as string;
  if (ticketId) setActiveTicketId(ticketId);
  if (houseId) {
    const house = HOUSES.find((h) => h.id === houseId);
    if (house) setCurrentHouse(house);
  }
}, [router.query]); // ❌ 整个对象，每次路由都是新引用

// 修复后
useEffect(() => {
  const houseId = router.query.houseId as string;
  const ticketId = router.query.ticketId as string;
  if (ticketId) setActiveTicketId(ticketId);
  if (houseId) {
    const house = HOUSES.find((h) => h.id === houseId);
    // ✅ identity guard：只在真正变化时才 setState
    if (house && house.id !== currentHouse?.id) setCurrentHouse(house);
  }
}, [router.query.houseId, router.query.ticketId]); // ✅ 精确到字符串值
```

**修复 B — 将 `MessagesProvider` 下移到仅包裹消息页（`_app.tsx` + `pages/messages/index.tsx`）：**

```tsx
// pages/_app.tsx — 移除 MessagesProvider
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Component {...pageProps} />
        </main>
      </div>
    </AppProvider>
  );
}
```

```tsx
// pages/messages/index.tsx — 用 MessagesProvider 包裹页面内容
const MessagesPage: NextPage<MessagesPageProps> = ({ initialTicketId }) => {
  return (
    <MessagesProvider>
      <MessagesPageContent initialTicketId={initialTicketId} />
    </MessagesProvider>
  );
};
```

**注意：** Sidebar 的 `unreadCount` 依赖 `MessagesContext`——下移后 Sidebar 无法访问。解决方案：

- 将 `unreadCount` 提升到 `AppContext`，或
- 新建轻量级 `UnreadCountContext` 保留在根层，`MessagesProvider` 仅管理消息详情状态。

**修复 C — `router.push` 加 `{ shallow: true }`（`pages/messages/index.tsx`）：**

```tsx
// 修复前
router.push(`/messages?ticketId=${ticket.id}&houseId=${ticket.houseId}`);

// 修复后
router.push(
  `/messages?ticketId=${ticket.id}&houseId=${ticket.houseId}`,
  undefined,
  { shallow: true }, // ✅ 不触发 getServerSideProps 重新执行
);
```

**关键知识点（第二轮追问）：**

- `shallow: true` 和「将 provider 下移」各自解决了什么问题？是否可以只做其中一个？
  - `shallow: true`：阻止 `getServerSideProps` 重新执行，但 context re-render 仍然会发生。
  - 下移 provider：从根本上隔离 re-render 范围，但不处理 shallow routing。
  - 两者都做是最完整的方案。
- 如果 `/messages` 页面的数据必须始终从服务器实时获取，`shallow: true` 是否合适？
  - 不合适。`shallow: true` 会跳过 `getServerSideProps`，数据不会刷新。需要去掉 shallow 并接受请求，或改用客户端 SWR 来获取实时数据。
- 为什么 `router.query` 每次路由变化都是新对象引用？
  - Next.js router 每次导航都重新构建 `query` 对象，即使参数值相同，引用也不同。`Object.is({}, {})` 为 `false`。

---

## 综合评分参考

| 分数                                 | 描述                                                            |
| ------------------------------------ | --------------------------------------------------------------- |
| **全部发现 + 正确修复**              | 4 个 bug 都找到，修复方案正确，`DECISIONS.md` 有清晰的权衡说明  |
| **发现 3 个 + 修复正确**             | 合格，第二轮重点追问遗漏的那个                                  |
| **只发现表面问题**                   | 如只发现 `console.log` 太多，没有找到根本原因，不建议进入第二轮 |
| **代码提交但 DECISIONS.md 非常空洞** | 警示信号，第二轮追问具体决策时会露馅                            |

### 自动通过信号

候选人找到以下两个问题，几乎可以确认是真实理解，非 AI 生成：

1. `getBookingStatus` 的 hoisting 崩溃（需要理解 TDZ 和 const 行为）
2. `router.query` 整体对象作为依赖的引用稳定性问题

### 自动警示信号

- `DECISIONS.md` 使用「使用 `useMemo` 提升性能」之类的通用描述，没有具体说明 _哪里_ 和 _为什么_
- 修复了 `console.log` 但没有发现背后的 re-render 问题
- 所有修复都是加 `React.memo` 和 `useMemo`，没有解决 context 架构问题
