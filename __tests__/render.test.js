const render = require("../src/render");

describe("get PR Comment", function () {
  describe("no files", function () {
    const files = {
      files: [],
    };
    it("coverage greater than min coverage", function () {
      const comment = render.getPRComment(49.23, files, 30, 50);
      expect(comment).toEqual(
        `> There is no coverage information present for the Files changed

|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|`
      );
    });

    it("coverage lesser than min coverage", function () {
      const comment = render.getPRComment(49.23, files, 70, 50);
      expect(comment).toEqual(
        `> There is no coverage information present for the Files changed

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
      );
    });

    it("with title", function () {
      const comment = render.getPRComment(49.23, files, 70, 50, "Coverage", null);
      expect(comment).toEqual(
        `### Coverage
> There is no coverage information present for the Files changed

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
      );
    });
  });

  describe("multiple files", function () {
    const files = {
      files: [
        {
          filePath: "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          name: "StringOp.java",
          covered: 7,
          missed: 0,
          percentage: 100,
        },
        {
          covered: 7,
          missed: 8,
          percentage: 46.67,
          filePath: "src/main/kotlin/com/madrapps/jacoco/Math.kt",
          name: "Math.kt",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
        },
      ],
      percentage: 63.64,
    };
    const baselineData = null;

    it("coverage greater than min coverage for overall project", function () {
      const comment = render.getPRComment(49.23, files, 30, 60, baselineData);
      expect(comment).toEqual(
        `|File|Coverage [63.64%]|:green_apple:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|

|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|`
      );
    });

    it("coverage lesser than min coverage for overall project", function () {
      const comment = render.getPRComment(49.23, files, 50, 64, baselineData);
      expect(comment).toEqual(
        `|File|Coverage [63.64%]|:x:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
      );
    });

    it("coverage greater than min coverage for changed files", function () {
      const comment = render.getPRComment(49.23, files, 30, 80, baselineData);
      expect(comment).toEqual(
        `|File|Coverage [63.64%]|:x:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|

|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|`
      );
    });

    it("coverage lesser than min coverage for overall project", function () {
      const comment = render.getPRComment(49.23, files, 50, 20, baselineData);
      expect(comment).toEqual(
        `|File|Coverage [63.64%]|:green_apple:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:green_apple:|

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
      );
    });

    it("with title", function () {
      const comment = render.getPRComment(49.23, files, 50, 20, "Coverage", baselineData);
      expect(comment).toEqual(
        `### Coverage
|File|Coverage [63.64%]|:green_apple:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:green_apple:|

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
      );
    });
  });

  describe("multiple files with reports", function () {
    const files = {
      files: [
        {
          filePath: "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          name: "StringOp.java",
          covered: 7,
          missed: 0,
          percentage: 100,
          htmlReportPath: "com.madrapps.jacoco.operation/StringOp.java",
        },
        {
          covered: 7,
          missed: 8,
          percentage: 46.67,
          filePath: "src/main/kotlin/com/madrapps/jacoco/Math.kt",
          name: "Math.kt",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
          htmlReportPath: "com.madrapps.jacoco/Math.kt",
        },
      ],
      percentage: 63.64,
    };
    const baselineFiles = {
      files: [
        {
          filePath: "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
          htmlReportPath: "com.madrapps.jacoco.operation/StringOp.java",
          name: "StringOp.java",
          covered: 7,
          missed: 0,
          percentage: 75,
        },
        {
          covered: 7,
          missed: 8,
          percentage: 50.01,
          filePath: "src/main/kotlin/com/madrapps/jacoco/Math.kt",
          name: "Math.kt",
          url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
          htmlReportPath: "com.madrapps.jacoco.operation/StringOp.java",
        },
      ],
      percentage: 60.64,
    };
    const ownerName = "thsaravana";
    const repoName = "jacoco-playground"
    const prNumber = 1170;
    const baselineData = {
      filesCoverage: baselineFiles,
      overallCoverage: 48.11,
      previewContext: {
      ownerName: ownerName,
      prNumber: prNumber,
      repoName: repoName,
      showPagesLinks: true,
      },
    };
    const title = "Titular Line";

    it("coverage greater than min coverage for overall project", function () {
      const comment = render.getPRComment(49.23, files, 30, 60, title, baselineData);
      expect(comment).toEqual(
        `### Titular Line
Coverage change is reported relative to the default branch.
|File|Coverage [63.64%]|Change [+3%]|:green_apple:|
|:-|:-:|:-:|:-:|
|[StringOp.java](https://${ownerName}.github.io/${repoName}/pr-preview/pr-${prNumber}/com.madrapps.jacoco.operation/StringOp.java)|100%|+25%|:green_apple:|
|[Math.kt](https://${ownerName}.github.io/${repoName}/pr-preview/pr-${prNumber}/com.madrapps.jacoco/Math.kt)|46.67%|-3.34%|:broken_heart:|

|Total Project Coverage|49.23%|+1.12%|:green_apple:|
|:-|:-:|:-:|:-:|`
      );
    });
  });
});
