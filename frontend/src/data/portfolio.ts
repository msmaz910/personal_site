export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  title: string
  context: string
  description: string
  tags: string[]
  links: ProjectLink[]
}

export interface ProjectGroup {
  heading: string
  projects: Project[]
}

/** Portfolio page content. The page renders groups and projects in this order. */
export const portfolio: ProjectGroup[] = [
  {
    heading: 'Personal Projects',
    projects: [
      {
        title: 'This Website',
        context: 'Personal site and AI chat',
        description:
          'A personal site with an AI chat that answers questions about my career from a single profile file. React and TypeScript front end, Python FastAPI backend, shipped as one Docker container on Vercel with GitHub Actions CI and tests on every change.',
        tags: ['React', 'TypeScript', 'Python', 'FastAPI', 'Docker', 'Vercel', 'AI'],
        links: [{ label: 'View source on GitHub', href: 'https://github.com/msmaz910/personal_site' }],
      },
    ],
  },
  {
    heading: 'Work Case Studies',
    projects: [
      {
        title: 'Customer Health Score',
        context: 'Product analytics SaaS company',
        description:
          'Built a multi-variable health score with a statistically significant correlation to renewal, then turned early-warning signals into an automated trigger system.',
        tags: ['SQL', 'R', 'Statistics'],
        links: [],
      },
      {
        title: 'Customer Success Metrics Dashboard',
        context: 'Product analytics SaaS company',
        description:
          "Built the team's operating metrics dashboard end to end, from SQL queries to Tableau, plus monthly churn and NPS reporting for executives.",
        tags: ['SQL', 'Tableau'],
        links: [],
      },
      {
        title: 'Automated Executive Reporting',
        context: 'National HR services company',
        description:
          'Multi-source dashboards for senior leaders with database-to-dashboard refreshes automated in Power Automate, plus capacity models that forecast team demand.',
        tags: ['SQL', 'Power BI', 'Power Automate'],
        links: [],
      },
      {
        title: 'Machine Learning on AI Prompts',
        context: 'National HR services company',
        description:
          'Trained machine learning models on AI prompt data in Python to power advanced analysis across the business. Helped build the internal data pipelines and datasets that let research and development scale.',
        tags: ['Python', 'Machine Learning'],
        links: [],
      },
      {
        title: 'Expense Audit',
        context: 'Medical device company',
        description:
          'Found $77K in billing waste and uncovered expense fraud that had gone undetected for seven months.',
        tags: ['Excel'],
        links: [],
      },
    ],
  },
]
