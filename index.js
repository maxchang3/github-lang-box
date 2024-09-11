#!/usr/bin/env node
//@ts-check
import "dotenv/config"
import { Octokit } from "@octokit/rest"
/** @typedef {import("@octokit/types").Endpoints} Endpoints */
/**
 * @template {keyof Endpoints} T
 * @typedef {Endpoints[T]["parameters"]} OctoParams
 */
/**
 * @template {keyof Endpoints} T
 * @typedef {Endpoints[T]["response"]} OctoResponse
 */
/**
 * @typedef {Endpoints["GET /user/repos"]["response"]["data"][0]} OctoRepo
 */

const {
    GIST_ID: gistId,
    GH_TOKEN: githubToken,
    GH_USERNAME: githubUsername,
    EXCLUDE: exclude,
    DESCRIPTION: description,
} = process.env

if (!githubUsername || !githubToken || !gistId) {
    console.error("Please provide all the required environment variables")
    if (!githubUsername) console.error("GH_USERNAME is required")
    if (!githubToken) console.error("GH_TOKEN is required")
    if (!gistId) console.error("GIST_ID is required")
    process.exit(1)
}

const octokit = new Octokit({
    auth: `token ${githubToken}`,
})

/**
 * @template {keyof Endpoints} T
 * @param {T} endpoint 
 * @param {OctoParams<T>} options 
 * @returns {Promise<OctoResponse<T>>}
 */
const octoRequest = async (endpoint, options) =>
    /** @ts-ignore */
    octokit.request(endpoint, options)

/**
 * @param {string} str 
 * @param {number} n 
 */
const truncate = (str, n) => {
    return str.length > n ? str.substr(0, n - 1) + "…" : str
}

/**
 * @param {Record<string, number>} langTotal 
 * @returns {Promise<string[]>}s
 */
const generateStatsLines = async (langTotal) => {
    const exc = (exclude ?? "").split(",")
    const top5 = Object.entries(langTotal)
        .filter((lang) => !exc.includes(lang[0]))
        .sort((a, b) => b[1] - a[1])
    const totalCode = top5.reduce((acc, [_, num]) => acc + num, 0)
    /** @type {[string, number][]} */
    const topPercent = top5.map(([a, b]) => [
        a, Math.round((b / totalCode) * 10000) / 100,
    ])
    /** @type {[string, number, number][]} */
    const numBars = topPercent.map(([a, b]) => [
        a, b, Math.ceil((b * 36) / 100),
    ])
    /** @type {string[]} */
    const lines = []
    numBars.forEach((lang) => {
        lines.push(
            `${truncate(lang[0] + " ", 12).padStart(12)}${"█".repeat(lang[2]) + "░".repeat(36 - lang[2])
            } ${(lang[1].toFixed(2) + "%").padStart(6)}`
        )
    })
    return lines
}

/**
 * @param {string} lines 
 */
const updateGist = async (lines) => {
    /** @type {Awaited<ReturnType<typeof octokit.gists.get>>} */
    let gist
    try {
        gist = await octokit.gists.get({ gist_id: gistId })
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
        return
    }
    console.log("Gist updated successfully!")
}

const calculateTotalLanguages = async () => {
    const repos = await octoRequest("GET /user/repos", {
        type: "owner",
        per_page: 100,
        sort: "updated",
        direction: "desc",
    })
    /** @type {Record<string, number>} */
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

/**
 * @param {OctoRepo} repo 
 * @returns 
 */
const getRepoLanguage = async (repo) => {
    if (repo.fork) return {}
    const languages = await octokit.repos.listLanguages({
        owner: githubUsername,
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
