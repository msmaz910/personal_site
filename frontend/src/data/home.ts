export interface HomeContent {
  title: string
  mission: string
  tags: string[]
  intro: string
  link: { label: string; to: string }
}

/** Home page content. The name comes from VITE_SITE_NAME. */
export const home: HomeContent = {
  title: 'Analytics Engineering Leader',
  mission: 'Building Data Pipelines That Drive Corporate Strategy',
  tags: ['Analytics', 'Snowflake', 'AI'],
  intro:
    "I currently lead Data Science Enterprise Analytics at Insperity, where I turn data from across the enterprise into dashboards, models, and pipelines that leaders use to set strategy. My path runs from Wall Street data desks through customer success to analytics engineering, so I build with the people who use the data in mind. Outside work you'll find me cycling, hiking, running, or building a dashboard for something that probably doesn't need one.",
  link: { label: 'View my portfolio', to: '/portfolio' },
}
