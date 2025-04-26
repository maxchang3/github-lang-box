import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import repo2lang from '~/fixtures/repo2lang.json' with { type: 'json' }
import repos from '~/fixtures/repos.json' with { type: 'json' }

const stubEnvs = (envs: Record<string, string | undefined>) =>
    Object.entries(envs).forEach(([key, value]) => vi.stubEnv(key, value))

vi.spyOn(console, 'log').mockImplementation(() => undefined)

const updateMock = vi.fn()

vi.mock('@octokit/rest', () => ({
    Octokit: vi.fn().mockImplementation(() => ({
        repos: {
            listForAuthenticatedUser: vi.fn().mockResolvedValue({
                data: repos,
            }),
            listLanguages: vi
                .fn()
                .mockImplementation(
                    ({ repo }: { repo: keyof typeof repo2lang }) => ({
                        data: repo2lang[repo],
                    })
                ),
        },
        gists: {
            get: vi.fn().mockResolvedValue({
                data: { files: { 'gistfile1.txt': { content: '' } } },
            }),
            update: updateMock,
        },
    })),
}))

describe('Lang box basics', () => {
    const runAction = async () => {
        vi.resetModules()
        return await import('../src/index')
    }

    beforeEach(() => {
        vi.clearAllMocks()
        stubEnvs({
            GIST_ID: '00000000000000000000000000000000',
            GH_TOKEN: 'github_pat_FAKED_TOKEN',
            GH_USERNAME: 'octocat',
            EXCLUDE: undefined,
            EXCLUDE_REPO: undefined,
            DESCRIPTION: undefined,
        })
    })

    afterEach(() => vi.unstubAllEnvs())

    it('should updates the Gist with the expected string', async () => {
        await runAction()
        expect(updateMock).toHaveBeenCalledOnce()
        expect(updateMock.mock.lastCall![0]).toMatchSnapshot()
    })

    it('should exclude languages set by `EXCLUDE`', async () => {
        vi.stubEnv(
            'EXCLUDE',
            'HTML,CSS,JSON,Jupyter Notebook,Markdown,Makefile,YAML,Shell'
        )
        await runAction()
        expect(updateMock).toHaveBeenCalledOnce()
        expect(updateMock.mock.lastCall![0]).toMatchSnapshot()
    })
})
