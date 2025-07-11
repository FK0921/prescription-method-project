// dataLoader.js
const path = require('path');
const XLSX = require('xlsx');

// 1) 读取用法表
const instrWb = XLSX.readFile(path.join(__dirname, 'data', 'medicine_instructions.xlsx'));
const instrData = XLSX.utils
  .sheet_to_json(instrWb.Sheets[instrWb.SheetNames[0]], { defval: '' })
  .map(item => ({
    name: item['药品名称'],       // 与你的 Excel 列头完全对应
    instructions: item['使用方法']
  }));

// 2) 读取处方示例表
const presWb = XLSX.readFile(path.join(__dirname, 'data', 'prescriptions.xlsx'));
const presData = XLSX.utils
  .sheet_to_json(presWb.Sheets[presWb.SheetNames[0]], { defval: '' });

// 3) 按名称长度降序排序，避免短名被长名截断
const medList = instrData.sort((a, b) => b.name.length - a.name.length);

/**
 * 从一段“原始处方文本”中提取所有匹配的药品名称及其 instructions
 * （如果你后续按列存储处方，这个函数可以不调用）
 */
function parsePrescription(text) {
  const found = [];
  medList.forEach(({ name, instructions }) => {
    if (text.includes(name)) {
      found.push({ name, instructions });
    }
  });
  // 去重
  const unique = [];
  const seen = new Set();
  for (const item of found) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      unique.push(item);
    }
  }
  return unique;
}

/**
 * 根据药品名称返回其使用方法（数组形式，一行为一条）
 */
function getInstructionsByName(name) {
  const rec = instrData.find(i => i.name === name);
  if (!rec || !rec.instructions) return [];
  return String(rec.instructions)
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s);
}

module.exports = { parsePrescription, getInstructionsByName };
