#!/usr/bin/env node
import { Octokit } from "@octokit/rest"
import { env } from "./env.js"
import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types"

const { GIST_ID, GH_TOKEN, GH_USERNAME, EXCLUDE, EXCLUDE_REPO, DESCRIPTION } = env

const octokit = new Octokit({
    auth: `token ${GH_TOKEN}`,
})

type OctoRepo = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.listForAuthenticatedUser>[number]

const truncate = (str: string, n: number) => {
    return str.length > n ? str.substring(0, n - 1) + "…" : str
}

const generateStatsLines = async (langTotal: Record<string, number>): Promise<string[]> => {
    const top5 = Object.entries(langTotal)
        .filter(([lang]) => !EXCLUDE.includes(lang))
        .sort((a, b) => b[1] - a[1])
    const totalCode = top5.reduce((acc, [_, num]) => acc + num, 0)
    const topPercent: [string, number][] = top5.map(([a, b]) => [
        a, Math.round((b / totalCode) * 10000) / 100,
    ])
    const numBars: [string, number, number][] = topPercent.map(([a, b]) => [
        a, b, Math.ceil((b * 36) / 100),
    ])
    const lines: string[] = []
    numBars.forEach((lang) => {
        lines.push(
            `${truncate(lang[0] + " ", 12).padStart(12)}${"█".repeat(lang[2]) + "░".repeat(36 - lang[2])
            } ${(lang[1].toFixed(2) + "%").padStart(6)}`
        )
    })
    return lines
}

const updateGist = async (lines: string) => {
    let gist: Awaited<ReturnType<typeof octokit.gists.get>>
    try {
        gist = await octokit.gists.get({ gist_id: GIST_ID })
    } catch (error) {
        console.error(`Unable to get gist\n${error}`)
        return
    }
    const files = gist.data.files
    if (!files) {
        console.error("No files found in the gist")
        return
    }
    const filename = Object.keys(files)[0]
    try {
        await octokit.gists.update({
            gist_id: GIST_ID,
            description: DESCRIPTION || "💻 Programming Language Stats",
            files: {
                [filename]: {
                    content: lines,
                },
            },
        })
    } catch (error) {
        console.error(`Unable to update gist\n${error}`)
        return
    }
    console.log("Gist updated successfully!")
}

const calculateTotalLanguages = async () => {
    const repos = await octokit.repos.listForAuthenticatedUser({
        type: "owner",
        per_page: 100,
        sort: "updated",
        direction: "desc",
    })
    const langTotal: Record<string, number> = {}
    const reposTotalLanguages = await Promise.all(
        repos.data
            .filter((repo) => !EXCLUDE_REPO.includes(repo.full_name))
            .map((repo) => getRepoLanguage(repo))
    )
    reposTotalLanguages.forEach((lang) => {
        let keys = Object.keys(lang)
        keys.map((x) => {
            if (langTotal[x]) langTotal[x] += lang[x]
            else langTotal[x] = lang[x]
        })
    })
    return langTotal
}

const getRepoLanguage = async (repo: OctoRepo) => {
    if (repo.fork) return {}
    const languages = await octokit.repos.listLanguages({
        owner: GH_USERNAME,
        repo: repo.name,
    })
    return languages.data
}

console.log("Calculating stats...")
const totalLang = await calculateTotalLanguages()
console.log("Total languages calculated")
console.log("Generating stats...")
const statsLine = (await generateStatsLines(totalLang)).join("\n")
console.log("Generated stats:")
console.log(statsLine)
console.log("Updating gist...")
await updateGist(statsLine)
