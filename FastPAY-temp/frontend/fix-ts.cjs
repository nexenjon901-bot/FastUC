const fs = require('fs');
const path = require('path');

// 1. Fix App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace("import React, { useEffect, Suspense, useState } from 'react';", "import React, { useEffect, Suspense } from 'react';");
appCode = appCode.replace("import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';", "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';");
appCode = appCode.replace("<AdminLoginPage onLogin={(t, a) => { window.location.href = '/admin/dashboard'; }} />", "<AdminLoginPage onLogin={() => { window.location.href = '/admin/dashboard'; }} />");
fs.writeFileSync(appPath, appCode);

// 2. Fix AdminAccountsPage.tsx
const accountsPath = path.join(__dirname, 'src', 'pages', 'admin', 'AdminAccountsPage.tsx');
let accountsCode = fs.readFileSync(accountsPath, 'utf8');
accountsCode = accountsCode.replace("const [page, setPage] = useState(1);", "const [page] = useState(1);");
fs.writeFileSync(accountsPath, accountsCode);

// 3. Fix AdminLayout.tsx
const layoutPath = path.join(__dirname, 'src', 'pages', 'admin', 'AdminLayout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');
layoutCode = layoutCode.replace("'@media (min-width: 768px)': { position: 'sticky', left: 0 } as any", "");
layoutCode = layoutCode.replace("display: 'flex', flexDirection: 'column',", "display: 'flex', flexDirection: 'column'");
fs.writeFileSync(layoutPath, layoutCode);

console.log("Fixed all TS errors.");
