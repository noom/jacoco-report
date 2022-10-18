function getPRComment(
  overallCoverage,
  filesCoverage,
  minCoverageOverall,
  minCoverageChangedFiles,
  previewContext,
  title,
  baselineData
  // TODO separate baselineData.filesCoverage and baselineData.percentage
) {
  const fileTable = getFileTable(filesCoverage, minCoverageChangedFiles, baselineData, previewContext);
  const heading = getTitle(title);
  if (baselineData == null) {
    const overallTable = getOverallTable(overallCoverage, minCoverageOverall, baselineData);
    return heading + fileTable + `\n\n` + overallTable;
  } 
  const overallTable = getOverallTableWithDelta(overallCoverage, minCoverageOverall, baselineData);
  return heading + fileTable + `\n\n` + overallTable;
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
    const baseline = baselineFiles.find(f => f.name == file.name);
    return baseline.percentage;
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
    var status = getStatus(coverage, minCoverage);
    const deltaCoverage = coverage - baselineCoverage;
    return `|File|Coverage [${formatCoverage(coverage)}]|Delta [${formatCoverageDelta(deltaCoverage)}]|${status}|`;
  }

  function getRowWithDelta(name, coverage, baselineCoverage) {
    //console.log(`coverage ${coverage}, baselineCoverage ${baselineCoverage}`)
    var status = getStatus(coverage, minCoverage);
    const deltaCoverage = coverage - baselineCoverage;
    return `|${name}|${formatCoverage(coverage)}|${formatCoverageDelta(deltaCoverage)}|${status}|`;
  }

  function getRow(name, coverage) {
    var status = getStatus(coverage, minCoverage);
    return `|${name}|${formatCoverage(coverage)}|${status}|`;
  }

  function addRow(row) {
    table = table + `\n` + row;
  }
}

function getOverallTableWithDelta(coverage, minCoverage, baselineData) {
  const status = getStatus(coverage, minCoverage);
  const deltaCoverage = coverage - baselineData.overallCoverage;
  const tableStructure = `|:-|:-:|:-:|:-:|`;
  const tableHeader = `|Total Project Coverage|${formatCoverage(
    coverage
  )}|${formatCoverageDelta(
    deltaCoverage
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

function formatCoverageDelta(coverageDelta, withEmoji=true) {
  const emoji = coverageDelta > 0 ? `:smile:` : `:cry:`;
  const postfix = withEmoji ? ` ${emoji}` : ``;
  const prefix = coverageDelta > 0 ? `+` : ``;
  return `${prefix}${parseFloat(coverageDelta.toFixed(2))}%${postfix}`;
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
