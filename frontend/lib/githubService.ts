/**
 * GitHub API Service for portfolio deployment
 * Used in Next.js API routes
 */

interface Axios {
  post(url: string, data?: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
  put(url: string, data?: any, config?: any): Promise<any>;
  delete(url: string, config?: any): Promise<any>;
}

let axios: Axios;

// Lazy load axios to support both client and server
async function loadAxios() {
  if (!axios) {
    const axiosModule = await import('axios');
    axios = axiosModule.default;
  }
  return axios;
}

export class GitHubService {
  private accessToken: string;
  private owner: string = '';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get authenticated user info
   */
  async getUser(): Promise<{ login: string; name: string }> {
    try {
      const ax = await loadAxios();
      const response = await ax.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      this.owner = response.data.login;
      return {
        login: response.data.login,
        name: response.data.name || response.data.login,
      };
    } catch (error) {
      throw new Error(`Failed to get GitHub user: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(repoName: string): Promise<any> {
    try {
      const ax = await loadAxios();
      const response = await ax.post('https://api.github.com/user/repos', {
        name: repoName,
        description: 'Portfolio deployed by Portfolio Builder',
        private: false,
        has_issues: false,
        has_projects: false,
        has_downloads: false,
        has_wiki: false,
      }, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error('Repository already exists');
      }
      throw new Error(`Failed to create repository: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Check if a repository already exists and is accessible
   */
  async repositoryExists(repoName: string): Promise<boolean> {
    try {
      if (!this.owner) {
        const user = await this.getUser();
        this.owner = user.login;
      }
      const ax = await loadAxios();
      await ax.get(`https://api.github.com/repos/${this.owner}/${repoName}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Upload files to repository
   */
  async uploadFiles(repoName: string, files: Array<{ path: string; content: string }>): Promise<void> {
    try {
      if (!this.owner) {
        const user = await this.getUser();
        this.owner = user.login;
      }
      const ax = await loadAxios();

      for (const file of files) {
        // Encode content to base64
        const encodedContent = Buffer.from(file.content).toString('base64');

        // Try to get existing file SHA
        let sha: string | undefined;
        try {
          const existingFile = await ax.get(
            `https://api.github.com/repos/${this.owner}/${repoName}/contents/${file.path}`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          sha = existingFile.data.sha;
        } catch (error: any) {
          // File doesn't exist yet, that's fine
          if (error.response?.status !== 404) {
            throw error;
          }
        }

        // Upload or update file
        const payload: any = {
          message: `Update ${file.path} - Portfolio Builder`,
          content: encodedContent,
          branch: 'main',
        };

        // Add SHA if file already exists
        if (sha) {
          payload.sha = sha;
        }

        await ax.put(
          `https://api.github.com/repos/${this.owner}/${repoName}/contents/${file.path}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
      }
    } catch (error) {
      throw new Error(`Failed to upload files: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Enable GitHub Pages for the repository
   */
  async enableGitHubPages(repoName: string): Promise<{ url: string }> {
    try {
      if (!this.owner) {
        const user = await this.getUser();
        this.owner = user.login;
      }
      
      const ax = await loadAxios();

      // Wait a moment for files to be fully committed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if index.html exists before enabling pages
      try {
        await ax.get(
          `https://api.github.com/repos/${this.owner}/${repoName}/contents/index.html`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error('index.html not found in repository. Files may not have uploaded correctly.');
        }
      }

      // Configure GitHub Pages
      try {
        await ax.post(
          `https://api.github.com/repos/${this.owner}/${repoName}/pages`,
          {
            source: {
              branch: 'main',
              path: '/',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
      } catch (error: any) {
        // Pages might already be enabled - that's fine
        if (error.response?.status !== 409) {
          throw error;
        }
      }

      // GitHub Pages URL
      const pageUrl = `https://${this.owner}.github.io/${repoName}/`;
      
      // Wait for GitHub Pages to build
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      return { url: pageUrl };
    } catch (error: any) {
      throw new Error(`Failed to enable GitHub Pages: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Helper method to extract error message
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

export default GitHubService;
