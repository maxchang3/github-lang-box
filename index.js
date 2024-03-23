#!/usr/bin/env node
import "dotenv/config"
import { Octokit } from "@octokit/rest"

const {
    GIST_ID: gistId,
    GH_TOKEN: githubToken,
    GH_USERNAME: githubUsername,
    EXCLUDE: exclude,
    DESCRIPTION: description,
} = process.env

const octokit = new Octokit({
    auth: `token ${githubToken}`,
})

const truncate = (str, n) => {
    return str.length > n ? str.substr(0, n - 1) + "…" : str
}

const totalLanguages = async () => {
    const repos = await getRepos()
    const exc = exclude.split(",")
    const top5 = Object.entries(repos)
        .filter((lang) => !exc.includes(lang[0]))
        .sort((a, b) => b[1] - a[1])

    const totalCode = top5.reduce((a, b) => a.map((v, i) => v + b[i]))[1]
    const topPercent = top5.map(([a, b]) => [
        a, Math.round((b / totalCode) * 10000) / 100,
    ])

    const numBars = topPercent.map(([a, b]) => [
        a, b, Math.ceil((b * 36) / 100),
    ])

    const lines = []
    numBars.forEach((lang) => {
        lines.push(
            `${truncate(lang[0] + " ", 12).padStart(12)}${"█".repeat(lang[2]) + "░".repeat(36 - lang[2])
            } ${(lang[1].toFixed(2) + "%").padStart(6)}`
        )
    })
    updateGist(lines.join("\n"))
}

const updateGist = async (lines) => {
    let gist
    try {
        gist = await octokit.gists.get({ gist_id: gistId })
    } catch (error) {
        console.error(`Unable to get gist\n${error}`)
    }

    const filename = Object.keys(gist.data.files)[0]

    try {
        await octokit.gists.update({
            gist_id: gistId,
            description: description || "💻 Programming Language Stats",
            files: {
                [filename]: {
                    content: lines,
                },
            },
        })
    } catch (error) {
        console.error(`Unable to update gist\n${error}`)
    }
}

const getRepos = async () => {
    const repos = await octokit.request("/user/repos", {
        username: githubUsername,
        type: "owner",
        per_page: 100,
        sort: "updated",
        direction: "desc",
    })

    const langTotal = {}

    const reposTotalLanguages = await Promise.all(repos.data.map((repo) => getRepoLanguage(repo)))

    reposTotalLanguages.forEach((lang) => {
        let keys = Object.keys(lang)

        keys.map((x) => {
            if (langTotal[x]) langTotal[x] += lang[x]
            else langTotal[x] = lang[x]
        })
    })

    return langTotal

}

const getRepoLanguage = async (repo) => {
    if (repo.fork) return {}
    const languages = await octokit.repos.listLanguages({
        owner: githubUsername,
        repo: repo.name,
    })

    return languages.data
}

await totalLanguages()
