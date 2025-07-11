// server.js
const express = require('express');
const path = require('path');
const XLSX = require('xlsx');
const { parsePrescription, getInstructionsByName } = require('./dataLoader');

// 读取 prescriptions.xlsx，构建 patientId -> 药品名称列表 映射
const presWb2 = XLSX.readFile(path.join(__dirname, 'data', 'prescriptions.xlsx'));
const presData2 = XLSX.utils.sheet_to_json(presWb2.Sheets[presWb2.SheetNames[0]], { defval: '' });
const presMap = {};
presData2.forEach(item => {
  const id = item['patientId'] || item.patientId;
  if (!id) return;
  // 收集除 patientId 外所有非空列的值，视作药品名称
  const drugs = Object.keys(item)
    .filter(key => key !== 'patientId' && item[key])
    .map(key => item[key]);
  presMap[id] = drugs;
});

const app = express();
const port = process.env.PORT || 3000;

// 前端静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 查询接口：GET /query?patientId=001
app.get('/query', (req, res) => {
  const { patientId } = req.query;
  if (!patientId) {
    return res.status(400).json({ error: '缺少 patientId 参数' });
  }
  const drugs = presMap[patientId];
  if (!drugs || drugs.length === 0) {
    return res.status(404).json({ error: `未找到 patientId 为 ${patientId} 的处方` });
  }

  // 映射使用方法
  const medications = drugs.map(name => ({
    name,
    instructions: getInstructionsByName(name)
  }));

  res.json({ patientId, medications });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
