const action = require("../src/action");
const core = require("@actions/core");
const github = require("@actions/github");

jest.mock("@actions/core");
jest.mock("@actions/github");

describe("Single report", function () {
  let createComment;
  let listComments;
  let updateComment;
  let output;

  function getInput(key) {
    switch (key) {
      case `paths`:
        return `./__tests__/__fixtures__/jacocoTestReport_delta.xml`;
      case `min-coverage-overall`:
        return 45;
      case `min-coverage-changed-files`:
        return 60;
      case `baseline-paths`:
        return `./__tests__/__fixtures__/jacocoTestReport_master.xml`;
      case `show-pages-links`:
        return `true`;
    }
  }

  beforeEach(() => {
    createComment = jest.fn();
    listComments = jest.fn();
    updateComment = jest.fn();
    output = jest.fn();

    core.getInput = jest.fn(getInput);
    github.getOctokit = jest.fn(() => {
      return {
        repos: {
          compareCommits: jest.fn(() => {
            return compareCommitsResponse;
          }),
        },
        issues: {
          createComment: createComment,
          listComments: listComments,
          updateComment: updateComment,
        },
      };
    });
    core.setFailed = jest.fn((c) => {
      fail(c);
    });
  })

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename: "src/main/java/com/noom/amityOnboarding/service/OnboardingService.kt",
          blob_url: "https://github.com/noom/community/src/main/java/com/noom/amityOnboarding/service/OnboardingService.kt",
        },
        {
          filename: "src/main/java/com/noom/amityOnboarding/service/TestNonsenseService.kt",
          blob_url: "https://github.com/noom/community/src/main/java/com/noom/amityOnboarding/service/TestNonsenseService.kt",
        },
        {
          filename: "src/main/java/com/noom/community/configuration/DatabaseConfiguration.java",
          blob_url: "https://github.com/noom/community/src/main/java/com/noom/community/configuration/DatabaseConfiguration.java",
        },
        {
          filename: "src/main/java/com/noom/web/TestController.kt",
          blob_url: "https://github.com/noom/community/src/main/java/com/noom/web/TestController.kt",
        },
        {
          filename: "src/test/java/com/noom/amityOnboarding/service/OnboardingServiceTest.kt",
          blob_url: "https://github.com/noom/community/src/test/java/com/noom/amityOnboarding/service/OnboardingServiceTest.kt",
        },
        {
          filename: "src/test/java/com/noom/amityOnboarding/service/TestNonsenseServiceTest.kt",
          blob_url: "https://github.com/noom/community/src/test/java/com/noom/amityOnboarding/service/TestNonsenseServiceTest.kt",
        }
      ],
    },
  };

  describe("Pull Request event", function () {
    const context = {
      eventName: "pull_request",
      payload: {
        pull_request: {
          number: "45",
          base: {
            sha: "guasft7asdtf78asfd87as6df7y2u3",
          },
          head: {
            sha: "aahsdflais76dfa78wrglghjkaghkj",
          },
        },
      },
      repo: {
        repo: "jacoco-playground",
        owner: "thsaravana",
      },
    };

    it("publish proper comment", async () => {
      github.context = context;

      await action.action();

      expect(createComment.mock.calls[0][0].body)
        .toEqual(`Coverage change is reported relative to the default branch.
|File|Coverage [14.99%]|Change [-19.86%]|:broken_heart:|
|:-|:-:|:-:|:-:|
|[TestNonsenseService.kt](https://thsaravana.github.io/jacoco-playground/pr-preview/pr-45/com.noom.amityOnboarding.service/TestNonsenseService.kt)|78.79%|+78.79%|:green_apple:|
|[OnboardingService.kt](https://thsaravana.github.io/jacoco-playground/pr-preview/pr-45/com.noom.amityOnboarding.service/OnboardingService.kt)|16.48%|-33.01%|:broken_heart:|
|[DatabaseConfiguration.java](https://thsaravana.github.io/jacoco-playground/pr-preview/pr-45/com.noom.community.configuration/DatabaseConfiguration.java)|0%|0%|:green_apple:|
|[TestController.kt](https://thsaravana.github.io/jacoco-playground/pr-preview/pr-45/com.noom.web/TestController.kt)|0%|0%|:green_apple:|

|Total Project Coverage|13.35%|-3.07%|:broken_heart:|
|:-|:-:|:-:|:-:|`);
    });

    it("updates a previous comment", async () => {
      github.context = context;

      const title = 'JaCoCo Report'
      core.getInput = jest.fn((c) => {
        switch (c) {
          case "title":
            return title;
          case "update-comment":
            return "true";
          default:
            return getInput(c)
        }
      });

      listComments.mockReturnValue({
        data: [
          {id: 1, body: "some comment"},
          {id: 2, body: `### ${title}\n to update`},
        ]
      })

      await action.action();

      expect(updateComment.mock.calls[0][0].comment_id).toEqual(2);
      expect(createComment).toHaveBeenCalledTimes(0);
    });

    it("set overall coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[0];
      expect(out).toEqual(["coverage-overall", 13.35]);
    });

    it("set changed files coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[1];
      expect(out).toEqual(["coverage-changed-files", 14.99]);
    });
  });

  describe("Pull Request Target event", function () {
    const context = {
      eventName: "pull_request_target",
      payload: {
        pull_request: {
          number: "45",
          base: {
            sha: "guasft7asdtf78asfd87as6df7y2u3",
          },
          head: {
            sha: "aahsdflais76dfa78wrglghjkaghkj",
          },
        },
      },
      repo: "jacoco-playground",
      owner: "thsaravana",
    };

    it("set overall coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[0];
      expect(out).toEqual(["coverage-overall", 13.35]);
    });
  })

  describe("Push event", function () {
    const context = {
      eventName: "push",
      payload: {
        before: "guasft7asdtf78asfd87as6df7y2u3",
        after: "aahsdflais76dfa78wrglghjkaghkj",
      },
      repo: "jacoco-playground",
      owner: "thsaravana",
    };

    it("set overall coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[0];
      expect(out).toEqual(["coverage-overall", 13.35]);
    });

    it("set changed files coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[1];
      expect(out).toEqual(["coverage-changed-files", 14.99]);
    });
  });

  describe("Other than push or pull_request or pull_request_target event", function () {
    const context = {
      eventName: "pr_review",
    };

    it("Fail by throwing appropriate error", async () => {
      github.context = context;
      core.setFailed = jest.fn((c) => {
        expect(c).toEqual(
          "Only pull requests and pushes are supported, pr_review not supported."
        );
      });
      core.setOutput = output;

      await action.action();
    });
  });
});
