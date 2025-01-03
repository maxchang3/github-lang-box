<p align="center">
  <img width="450" src="https://user-images.githubusercontent.com/31800695/138593031-536f9b8c-714c-4c4f-8725-63ea105fcca0.png">
  <h3 align="center">github-lang-box</h3>
  <p align="center">💻 使用 Gist 显示你最常用的编程语言</p>
</p>

# github-lang-box [![npm](https://img.shields.io/npm/v/github-lang-box)](https://www.npmjs.com/package/github-lang-box)

这是 [lang-stats-box](https://github.com/Aveek-Saha/lang-stats-box) 的一个 fork，做了以下定制修改：

- 更新了依赖，使用 TypeScript 重写
- 发布到 npm，可作为 CLI 使用（`npx` 或 `pnpx`）
- 使用 `/user/repos` 接口，可以获取用户的所有仓库（包括私有仓库）
- 自定义描述（`description`）)，排除语言和仓库！

> **注意**: 由于使用了 `/user/repos` 接口，如果使用「Fine-grained access tokens」必须具有 `metadata:read` 权限。

## 设置

### 准备工作

1. 创建一个新的公共的 GitHub Gist (https://gist.github.com/)
2. 创建一个具有 `gist` 和 `metadata:read` 权限的 token 复制它。(https://github.com/settings/tokens?type=beta)

### 项目设置

1. 将 [这个文件](./action.yml) 复制到你的仓库的 `.github/workflows` 目录。
2. 转到仓库的 **Settings > Secrets**
3. 添加以下环境变量：
    - **GH_TOKEN:** 上面生成的 GitHub token。
    - **GIST_ID:** 从你的 Gist URL 中获取的 ID 部分：<br> `https://gist.github.com/Aveek-Saha/` **`8335e85451541072dd25fda601129f7d`**。
    - **GH_USERNAME:** 你的 `GitHub` 账户用户名。
    - **EXCLUDE:** 你想从 Gist 中排除的语言（使用半角逗号分隔）。<br> 例如：_Jupyter Notebook, CSS, TeX, PHP_
    - **EXCLUDE_REPO**: 你想从 Gist 中排除的仓库（使用半角逗号分隔）。<br> 例如：_username/repo1, username/repo2_
    - **DESCRIPTION:** Gist 的自定义描述。

### 作为 CLI 使用

将环境变量添加到 `.env` 文件或在 shell 中 `export` ，然后运行：

```bash
npx github-lang-box@1
# 或
# pnpx github-lang-box@1
```

此外，你也可以在具有 Node.js 运行时的 GitHub Actions 中使用这些命令。请查看 [这个文件](./action.yml)。

#### 选项

- `--dry`: 干运行，只获取数据并打印输出。

## 致谢

灵感来自 [@matchai 的 bird-box](https://github.com/matchai/bird-box)。

这是 [@Aveek-Saha 的 lang-stats-box](https://github.com/Aveek-Saha/lang-stats-box) 的一个 fork。
