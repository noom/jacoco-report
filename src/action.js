const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const parser = require("xml2js");
const { parseBooleans } = require("xml2js/lib/processors");
const process = require("./process");
const render = require("./render");

async function action() {
  try {
    const pathsString = core.getInput("paths");
    const reportPaths = pathsString.split(",");
    const showPagesLinks = parseBooleans(core.getInput("show-pages-links"));
    const baselinePathsString = core.getInput("baseline-paths");
    const baselineReportPaths = baselinePathsString.split(",").filter(p => p.length > 0);
    const minCoverageOverall = parseFloat(
      core.getInput("min-coverage-overall")
    );
    const minCoverageChangedFiles = parseFloat(
      core.getInput("min-coverage-changed-files")
    );
    const title = core.getInput("title");
    const updateComment = parseBooleans(core.getInput("update-comment"));
    const debugMode = parseBooleans(core.getInput("debug-mode"));
    const event = github.context.eventName;
    core.info(`Event is ${event}`);

    var base;
    var head;
    var prNumber;
    switch (event) {
      case "pull_request":
      case "pull_request_target":
        base = github.context.payload.pull_request.base.sha;
        head = github.context.payload.pull_request.head.sha;
        prNumber = github.context.payload.pull_request.number;
        break;
      case "push":
        base = github.context.payload.before;
        head = github.context.payload.after;
        isPR = false;
        break;
      default:
        throw `Only pull requests and pushes are supported, ${github.context.eventName} not supported.`;
    }

    core.info(`base sha: ${base}`);
    core.info(`head sha: ${head}`);

    const client = github.getOctokit(core.getInput("token"));

    const coverageInfo = await getCoverageInfo(reportPaths, base, head, client, debugMode);
    const overallCoverage = coverageInfo.overallCoverage;
    const filesCoverage = coverageInfo.filesCoverage;
    core.setOutput(
      "coverage-overall",
      parseFloat(overallCoverage.project.toFixed(2))
    );
    core.setOutput(
      "coverage-changed-files",
      parseFloat(filesCoverage.percentage.toFixed(2))
    );

    var baselineData = null;
    if (baselineReportPaths.length > 0) {
      baselineData = await getCoverageInfo(baselineReportPaths, base, head, client, debugMode);
      baselineData.overallCoverage = baselineData.overallCoverage.project;
    }

    if (prNumber != null) {
      const previewContext = {
        prNumber: prNumber,
        ownerName: github.context.repo.owner,
        repoName: github.context.repo.repo,
        showPagesLinks: showPagesLinks,
      };
      await addComment(
        prNumber,
        updateComment,
        render.getTitle(title),
        render.getPRComment(
          overallCoverage.project,
          filesCoverage,
          minCoverageOverall,
          minCoverageChangedFiles,
          previewContext,
          title,
          baselineData
        ),
        client
      );
    }
  } catch (error) {
    core.setFailed(error);
  }
}

function debug(obj) {
  return JSON.stringify(obj, " ", 2);
}

async function getCoverageInfo(reportPaths, base, head, client, debugMode) {
  if (debugMode) core.info(`reportPaths: ${reportPaths}`);
  const reportsJsonAsync = getJsonReports(reportPaths);
  const changedFiles = await getChangedFiles(base, head, client);
  if (debugMode) core.info(`changedFiles: ${debug(changedFiles)}`);

  const reportsJson = await reportsJsonAsync;
  if (debugMode) core.info(`report value: ${debug(reportsJson)}`);
  const reports = reportsJson.map((report) => report["report"]);

  const overallCoverage = process.getOverallCoverage(reports);
  if (debugMode) core.info(`overallCoverage: ${overallCoverage}`);

  const filesCoverage = process.getFileCoverage(reports, changedFiles);
  if (debugMode) core.info(`filesCoverage: ${debug(filesCoverage)}`);
  return {
    "filesCoverage": filesCoverage,
    "overallCoverage": overallCoverage
  };
}


async function getJsonReports(xmlPaths) {
  return Promise.all(
    xmlPaths.map(async (xmlPath) => {
      const reportXml = await fs.promises.readFile(xmlPath.trim(), "utf-8");
      return await parser.parseStringPromise(reportXml);
    })
  );
}

async function getChangedFiles(base, head, client) {
  const response = await client.repos.compareCommits({
    base,
    head,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  var changedFiles = [];
  response.data.files.forEach((file) => {
    var changedFile = {
      filePath: file.filename,
      url: file.blob_url
    };
    changedFiles.push(changedFile);
  });
  return changedFiles;
}

async function addComment(prNumber, update, title, body, client) {
  let commentUpdated = false;

  if (update && title) {
    const comments = await client.issues.listComments({
      issue_number: prNumber,
      ...github.context.repo,
    });
    const comment = comments.data.find((comment) =>
      comment.body.startsWith(title),
    );

    if (comment) {
      await client.issues.updateComment({
        comment_id: comment.id,
        body: body,
        ...github.context.repo,
      });
      commentUpdated = true;
    }
  }

  if (!commentUpdated) {
    await client.issues.createComment({
      issue_number: prNumber,
      body: body,
      ...github.context.repo,
    });
  }
}

module.exports = {
  action,
};
