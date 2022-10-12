function getPRComment(
  overallCoverage,
  filesCoverage,
  minCoverageOverall,
  minCoverageChangedFiles,
  title,
  prNumber
) {
  const fileTable = getFileTable(filesCoverage, minCoverageChangedFiles, prNumber);
  const overallTable = getOverallTable(overallCoverage, minCoverageOverall);
  const heading = getTitle(title);
  return heading + fileTable + `\n\n` + overallTable;
}

function getFileTable(filesCoverage, minCoverage, prNumber) {
  const files = filesCoverage.files;
  if (files.length === 0) {
    return `> There is no coverage information present for the Files changed`;
  }

  const tableHeader = getHeader(filesCoverage.percentage);
  const tableStructure = `|:-|:-:|:-:|`;
  var table = tableHeader + `\n` + tableStructure;
  files.forEach((file) => {
    let previewUrl = formatPreviewUrl("noom", "community", prNumber, file.htmlReportPath);
    renderFileRow(`[${file.name}](${previewUrl})`, file.percentage);
  });
  return table;

  function renderFileRow(name, coverage) {
    addRow(getRow(name, coverage));
  }

  function getHeader(coverage) {
    var status = getStatus(coverage, minCoverage);
    return `|File|Coverage [${formatCoverage(coverage)}]|${status}|`;
  }

  function getRow(name, coverage) {
    var status = getStatus(coverage, minCoverage);
    return `|${name}|${formatCoverage(coverage)}|${status}|`;
  }

  function addRow(row) {
    table = table + `\n` + row;
  }
}

function getOverallTable(coverage, minCoverage) {
  var status = getStatus(coverage, minCoverage);
  const tableHeader = `|Total Project Coverage|${formatCoverage(
    coverage
  )}|${status}|`;
  const tableStructure = `|:-|:-:|:-:|`;
  return tableHeader + `\n` + tableStructure;
}

function getTitle(title) {
  if (title != null && title.length > 0) {
    return "### " + title + `\n`;
  } else {
    return "";
  }
}

function getStatus(coverage, minCoverage) {
  var status = `:green_apple:`;
  if (coverage < minCoverage) {
    status = `:x:`;
  }
  return status;
}

function formatCoverage(coverage) {
  return `${parseFloat(coverage.toFixed(2))}%`;
}

function formatPreviewUrl(ownerName, repoName, prNumber, filePath) {
    return `https://${ownerName}.github.io/${repoName}/pr-preview/pr-${prNumber}/${filePath}`;
}

module.exports = {
  getPRComment,
  getTitle,
};
