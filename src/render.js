function getPRComment(
  overallCoverage,
  filesCoverage,
  minCoverageOverall,
  minCoverageChangedFiles,
  previewContext,
  title,
  baselineData
) {
  const fileTable = getFileTable(filesCoverage, minCoverageChangedFiles, baselineData, previewContext);
  const heading = getTitle(title);
  const description = getDescription(baselineData);
  if (baselineData == null) {
    const overallTable = getOverallTable(overallCoverage, minCoverageOverall);
    return heading + description + fileTable + `\n\n` + overallTable;
  } 
  const overallTable = getOverallTableWithDelta(overallCoverage, baselineData.overallCoverage);
  return heading + description + fileTable + `\n\n` + overallTable;
}

function getFileTable(filesCoverage, minCoverage, baselineData, previewContext) {
  const files = filesCoverage.files;
  if (files.length === 0) {
    return `> There is no coverage information present for the Files changed`;
  }

  var tableHeader = getHeader(filesCoverage.percentage);
  var tableStructure = `|:-|:-:|:-:|`;

  if (baselineData != null) {
    tableHeader = getHeaderWithDelta(filesCoverage.percentage, baselineData.filesCoverage.percentage);
    tableStructure += `:-:|`;
  }

  var table = tableHeader + `\n` + tableStructure;
  files.forEach((file) => {
    let previewUrl = formatPreviewUrl(file, previewContext);
    if (baselineData != null) {
      const baselinePercentage = getBaselinePercentageFor(file, baselineData.filesCoverage.files);
      renderFileRowWithDelta(`[${file.name}](${previewUrl})`, file.percentage, baselinePercentage);
    } else {
      renderFileRow(`[${file.name}](${previewUrl})`, file.percentage);
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
    return `|File|Coverage [${formatCoverage(coverage)}]|${status}|`;
  }

  function getHeaderWithDelta(coverage, baselineCoverage) {
    var status = getDeltaStatus(baselineCoverage, coverage);
    return `|File|Coverage [${formatCoverage(coverage)}]|Change [${formatCoverageDelta(baselineCoverage, coverage)}]|${status}|`;
  }

  function getRowWithDelta(name, coverage, baselineCoverage) {
    var status = getDeltaStatus(baselineCoverage, coverage);
    return `|${name}|${formatCoverage(coverage)}|${formatCoverageDelta(baselineCoverage, coverage)}|${status}|`;
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

function getDescription(baselineData) {
  if (baselineData == null) {
    return "";
  }
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
  const {ownerName, prNumber, repoName, showPagesLinks} = previewContext;
  if (showPagesLinks) {
    return `https://${ownerName}.github.io/${repoName}/pr-preview/pr-${prNumber}/${file.htmlReportPath}`;
  }
  return file.url
}

module.exports = {
  getPRComment,
  getTitle,
};
