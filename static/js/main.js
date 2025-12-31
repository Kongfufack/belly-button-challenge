const renameTemplates = {
  powershellPreview: ({ folder, date, separator }) => `Get-ChildItem -Path "${folder}" -Filter "*.docx" -File |
  Rename-Item -NewName { $_.Name -replace '^(\\d{4}[._-]\\d{1,2}[._-]\\d{1,2})\\s*', '${date}${separator}' } -WhatIf`,
  powershellRun: ({ folder, date, separator }) => `Get-ChildItem -Path "${folder}" -Filter "*.docx" -File |
  Rename-Item -NewName { $_.Name -replace '^(\\d{4}[._-]\\d{1,2}[._-]\\d{1,2})\\s*', '${date}${separator}' }`,
  bash: ({ folder, date, separator }) => `target_dir="${folder}"
separator="${separator}"
new_date="${date}"

shopt -s nullglob
for f in "${target_dir}"/*.docx; do
  base="$(basename "$f")"
  rest="${base#*$separator}"
  if [ "$rest" = "$base" ] || [ -z "$rest" ]; then
    rest="$base"
  fi
  mv -- "$f" "${target_dir%/}/${new_date}${separator}${rest}"
done
shopt -u nullglob`
};

const downloadableScripts = {
  'rename-windows-preview.ps1': `param(
  [Parameter(Mandatory = $true)][string]$TargetFolder,
  [Parameter(Mandatory = $true)][string]$NewDate,
  [string]$Separator = ' ' 
)

Get-ChildItem -Path $TargetFolder -Filter '*.docx' -File |
  Rename-Item -NewName { $_.Name -replace '^(\\d{4}[._-]\\d{1,2}[._-]\\d{1,2})\\s*', "$NewDate$Separator" } -WhatIf
`,
  'rename-windows-run.ps1': `param(
  [Parameter(Mandatory = $true)][string]$TargetFolder,
  [Parameter(Mandatory = $true)][string]$NewDate,
  [string]$Separator = ' ' 
)

Get-ChildItem -Path $TargetFolder -Filter '*.docx' -File |
  Rename-Item -NewName { $_.Name -replace '^(\\d{4}[._-]\\d{1,2}[._-]\\d{1,2})\\s*', "$NewDate$Separator" }
`,
  'rename-macos.sh': `#!/usr/bin/env bash
set -euo pipefail

TARGET_FOLDER="${1:-.}"
NEW_DATE="${2:-2026.1.30}"
SEPARATOR="${3:- }"

shopt -s nullglob
for file in "$TARGET_FOLDER"/*.docx; do
  base="$(basename "$file")"
  rest="${base#*$SEPARATOR}"
  if [ "$rest" = "$base" ] || [ -z "$rest" ]; then
    rest="$base"
  fi
  mv -- "$file" "${TARGET_FOLDER%/}/${NEW_DATE}${SEPARATOR}${rest}"
done
shopt -u nullglob
`,
  'batch_replace.py': `from pathlib import Path
from typing import Dict
from docx import Document

# 要替换的键值对："旧文本": "新文本"
FIND_REPLACE: Dict[str, str] = {
    "2024.12.01": "2026.1.30",
    "示例签名": "张三",
    "示例公司": "XX 公司"
}

# 目标目录（默认当前目录），也可以改成绝对路径
TARGET_FOLDER = Path('.')


def replace_in_paragraphs(paragraphs, mapping):
    for paragraph in paragraphs:
        for old, new in mapping.items():
            if old in paragraph.text:
                for run in paragraph.runs:
                    run.text = run.text.replace(old, new)


def replace_in_tables(tables, mapping):
    for table in tables:
        for row in table.rows:
            for cell in row.cells:
                replace_in_paragraphs(cell.paragraphs, mapping)


def process_docx(path: Path):
    doc = Document(path)
    replace_in_paragraphs(doc.paragraphs, FIND_REPLACE)
    replace_in_tables(doc.tables, FIND_REPLACE)
    output_path = path.with_name(path.stem + '_updated' + path.suffix)
    doc.save(output_path)
    return output_path


def main():
    if not TARGET_FOLDER.exists():
        raise SystemExit(f"目录不存在: {TARGET_FOLDER}")

    processed = []
    for doc_path in TARGET_FOLDER.rglob('*.docx'):
        processed.append(process_docx(doc_path))

    print(f"完成 {len(processed)} 个文件：")
    for item in processed:
        print(f"- {item}")


if __name__ == '__main__':
    main()
`
};

function updateCommands() {
  const folder = document.querySelector('#rename-folder')?.value || '.';
  const date = document.querySelector('#rename-date')?.value || '2026.1.30';
  const separator = document.querySelector('#rename-suffix')?.value || ' ';

  const psCommand = renameTemplates.powershellPreview({ folder, date, separator });
  const bashCommand = renameTemplates.bash({ folder, date, separator });

  document.querySelector('#powershell-command').textContent = psCommand;
  document.querySelector('#bash-command').textContent = bashCommand;
}

function attachCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const code = document.getElementById(targetId)?.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '已复制';
        setTimeout(() => (btn.textContent = '复制'), 1600);
      });
    });
  });
}

function attachDownloadButtons() {
  document.querySelectorAll('[data-download]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filename = btn.getAttribute('data-download');
      const content = downloadableScripts[filename];
      if (!content) return;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  });
}

function populatePythonScript() {
  const codeBlock = document.getElementById('python-script');
  if (codeBlock) {
    codeBlock.textContent = downloadableScripts['batch_replace.py'];
  }
}

function initRenameForm() {
  ['rename-folder', 'rename-date', 'rename-suffix'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateCommands);
    }
  });
  updateCommands();
}

document.addEventListener('DOMContentLoaded', () => {
  populatePythonScript();
  attachCopyButtons();
  attachDownloadButtons();
  initRenameForm();
});
