/**
 * GitHub API helper — creates/updates issues on linked GitHub repos
 */

interface GitHubIssuePayload {
  title: string
  body: string
  labels?: string[]
}

export async function createGitHubIssue(
  owner: string,
  repo: string,
  token: string,
  payload: GitHubIssuePayload
): Promise<{ number: number; html_url: string } | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function closeGitHubIssue(
  owner: string,
  repo: string,
  token: string,
  issueNumber: number
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ state: 'closed' }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function addGitHubLabel(
  owner: string,
  repo: string,
  token: string,
  issueNumber: number,
  label: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ labels: [label] }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}
