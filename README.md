<p align="center">
  <img width="450" src="https://user-images.githubusercontent.com/31800695/138593031-536f9b8c-714c-4c4f-8725-63ea105fcca0.png">
  <h3 align="center">github-lang-box</h3>
  <p align="center">💻 Update a pinned gist to show your most used programming languages</p>
</p>

# github-lang-box [![npm](https://img.shields.io/npm/v/github-lang-box)](https://www.npmjs.com/package/github-lang-box)

Fork of [lang-stats-box](https://github.com/Aveek-Saha/lang-stats-box) with some customizations:

* Updated dependencies
* Published to npm, Added binary for use with `npx` or `pnpm dlx`
* Use `/user/repos` endpoint to fetch all repos of the user (including private repos)
* Custom `description`

> **Note**: Due to the use of `/user/repos` endpoint, the Fine-grained access tokens must have the `metadata:read` permission.

## Setup

### Prep work

1. Create a new public GitHub Gist (https://gist.github.com/)
2. Create an access token with the `gist` and `metadata:read` scopes and copy it.(https://github.com/settings/tokens?type=beta)

### Project setup

1. Copy [this workflow file](./action.yml) to your repo's `.github/workflows` directory.
2. Go to the repo **Settings > Secrets**
3. Add the following environment variables:
    - **GH_TOKEN:** The GitHub access token generated above.
    - **GIST_ID:** The ID portion from your gist url: <br> `https://gist.github.com/Aveek-Saha/` **`8335e85451541072dd25fda601129f7d`**.
    - **GH_USERNAME:** Your `GitHub` account username.
    - **EXCLUDE:** A comma separated list of languages you want to exclude from the gist. <br> Eg: _Jupyter Notebook, CSS, TeX, PHP_
    - **EXCLUDE_REPO**: A comma separated list of repositories you want to exclude from the gist. <br> Eg: _username/repo1, username/repo2_
    - **DESCRIPTION:** A custom description for the gist.

### Use as a CLI

Add environment variables to `.env` file or export them in the shell, then run:

```bash
npx github-lang-box@1
# or
# pnpm dlx github-lang-box@1
```

Additionally, you can use these commands in your GitHub Actions with a Node.js runtime. Refer to the [this workflow file](./action.yml).

#### Options

* `--dry`: Dry run, only fetch the data and print the output.

## Credits

This code was inspired by [@matchai's bird-box](https://github.com/matchai/bird-box).

This is a fork of [@Aveek-Saha's lang-stats-box](https://github.com/Aveek-Saha/lang-stats-box).
