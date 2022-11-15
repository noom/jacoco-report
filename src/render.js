function getPRComment(
  overallCoverage,
  filesCoverage,
  minCoverageOverall,
  minCoverageChangedFiles,
  title,
  baselineData
) {
  const fileTable = getFileTable(filesCoverage, minCoverageChangedFiles, baselineData);
  const heading = getTitle(title);
  if (baselineData == null) {
    const overallTable = getOverallTable(overallCoverage, minCoverageOverall);
    return heading + fileTable + `\n\n` + overallTable;
  } 
  const description = getDeltaDescription();
  const overallTable = getOverallTableWithDelta(overallCoverage, baselineData.overallCoverage);
  return heading + description + fileTable + `\n\n` + overallTable;
}

function getFileTable(filesCoverage, minCoverage, baselineData) {
  const files = filesCoverage.files;
  if (files.length === 0) {
    return `> There is no coverage information present for the Files changed`;
  }

  var table = baselineData == null ?
    getHeader(filesCoverage.percentage) :
    getHeaderWithDelta(filesCoverage.percentage, baselineData.filesCoverage.percentage);

  files.forEach((file) => {
    if (baselineData != null) {
      const previewUrl = formatPreviewUrl(file, baselineData.previewContext);
      const baselinePercentage = getBaselinePercentageFor(file, baselineData.filesCoverage.files);
      renderFileRowWithDelta(`[${file.name}](${previewUrl})`, file.percentage, baselinePercentage);
    } else {
      renderFileRow(`[${file.name}](${file.url})`, file.percentage);
    }
  });
  return table;

  function getBaselinePercentageFor(file, baselineFiles) {
    // Returns percentage or undefined if file DNE
    const baseline = baselineFiles.find(f => f.name == file.name);
    return baseline?.percentage;
  }

  function renderFileRow(name, coverage) {
    addRow(getRow(name, coverage));
  }

  function renderFileRowWithDelta(name, coverage, baselineCoverage) {
    addRow(getRowWithDelta(name, coverage, baselineCoverage));
  }

  function getHeader(coverage) {
    var status = getStatus(coverage, minCoverage);
    const structure = `|:-|:-:|:-:|`;
    return `|File|Coverage [${formatCoverage(coverage)}]|${status}|\n${structure}`;
  }

  function getHeaderWithDelta(coverage, baselineCoverage) {
    var status = getDeltaStatus(baselineCoverage, coverage);
    const change = formatCoverageDelta(baselineCoverage, coverage);
    const structure = `|:-|:-:|:-:|:-:|`;
    return `|File|Coverage [${formatCoverage(coverage)}]|Change [${change}]|${status}|\n${structure}`;
  }

  function getRowWithDelta(name, coverage, baselineCoverage) {
    var status = getDeltaStatus(baselineCoverage, coverage);
    const change = formatCoverageDelta(baselineCoverage, coverage);
    return `|${name}|${formatCoverage(coverage)}|${change}|${status}|`;
  }

  function getRow(name, coverage) {
    var status = getStatus(coverage, minCoverage);
    return `|${name}|${formatCoverage(coverage)}|${status}|`;
  }

  function addRow(row) {
    table = table + `\n` + row;
  }
}

function getOverallTableWithDelta(coverage, baselineCoverage) {
  const tableStructure = `|:-|:-:|:-:|:-:|`;
  const status = getDeltaStatus(baselineCoverage, coverage);
  const tableHeader = `|Total Project Coverage|${formatCoverage(
    coverage
  )}|${formatCoverageDelta(
    baselineCoverage, coverage
  )}|${status}|`;
  return tableHeader + `\n` + tableStructure;
}

function getOverallTable(coverage, minCoverage) {
  var status = getStatus(coverage, minCoverage);
  var tableHeader = `|Total Project Coverage|${formatCoverage(
    coverage
  )}|${status}|`;
  var tableStructure = `|:-|:-:|:-:|`;
  return tableHeader + `\n` + tableStructure;
}

function getDeltaDescription() {
  return `Coverage change is reported relative to the default branch.\n`;
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

function getDeltaStatus(previous, current) {
  var coverageDelta = current - previous;
  if (isNaN(coverageDelta)) {
    coverageDelta = current;
  }
  const emoji = coverageDelta >= 0 ? `:green_apple:` : `:broken_heart:`;
  return emoji;
}

function formatCoverageDelta(previous, current) {
  var coverageDelta = current - previous;
  if (isNaN(coverageDelta)) {
    coverageDelta = current;
  }
  if (coverageDelta === undefined) {
    return `---`;
  }
  const prefix = coverageDelta > 0 ? `+` : ``;
  return `${prefix}${parseFloat(coverageDelta.toFixed(2))}%`;
}

function formatPreviewUrl(file, previewContext) {
  const {ownerName, prNumber, repoName} = previewContext;
  return `https://${ownerName}.github.io/${repoName}/pr-preview/pr-${prNumber}/${file.htmlReportPath}`;
}

module.exports = {
  getPRComment,
  getTitle,
};
