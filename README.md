# jacoco-report

[![Tests](https://github.com/noom/jacoco-report/actions/workflows/check.yml/badge.svg)](https://github.com/noom/jacoco-report/actions/workflows/check.yml)

A Github action that publishes the JaCoCo report as a comment in the Pull Request with customizable pass percentage for modified files and for the entire project.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `paths` - [**required**] Comma separated paths of the generated jacoco xml files.
- `token` - [**required**] Github personal token to add commits to Pull Request
- `min-coverage-overall` - [*optional*] The minimum code coverage that is required to pass for overall project
- `min-coverage-changed-files` - [*optional*] The minimum code coverage that is required to pass for changed files
- `update-comment` - [*optional*] Updates the coverage report comment instead of creating new ones. Requires `title` to work properly.
- `title` - [*optional*] Title for the Pull Request comment

### Outputs

- `coverage-overall` - The overall coverage of the project
- `coverage-changed-files` - The total coverage of all changed files

### Example Workflow

```yaml
name: Measure coverage

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - name: Run Coverage
        run: |
          chmod +x gradlew
          ./gradlew testCoverage

      - name: Add coverage to PR
        id: jacoco
        uses: madrapps/jacoco-report@v1.3
        with:
          paths: ${{ github.workspace }}/build/reports/jacoco/testCoverage/testCoverage.xml
          token: ${{ secrets.GITHUB_TOKEN }}
          min-coverage-overall: 40
          min-coverage-changed-files: 60
```

<br>
<img src="/preview/screenshot.png" alt="output screenshot" title="output screenshot" width="500" />

### Example Project

For a working project refer to [jacoco-playgound](https://github.com/thsaravana/jacoco-playground). Check out the PR's in
the project to get an idea on how the report is shown on a pull request comment.
For multi module gradle project, refer [jacoco-android-playground](https://github.com/thsaravana/jacoco-android-playground)

## Development

### Local
You can change the `main` entry in the `runs` heading in `action.yml` to read as follows:
```
runs:
  using: "node16"
  main: "index.js"
```
Normally this should read `main: "dist/index.js"`, see below.

Test via
```
# npm install if this is a fresh init
npm test
```

### Distribution
Github recommends
[running actions via built packages under `dist/`](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github),
to iterate you'll need to install `ncc` and build with that. On MacOS this is

```
brew install ncc
ncc build src/index.js -o dist
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
