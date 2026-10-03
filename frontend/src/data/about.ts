export interface AboutSection {
  heading: string
  paragraphs: string[]
}

export interface AboutContent {
  story: string[]
  skills: string[]
  sections: AboutSection[]
}

/** About page content: opening story, core skills, then titled sections. */
export const about: AboutContent = {
  story: [
    'My career has taken an unusual route to analytics engineering. I first studied art and art history, then earned a degree in education and an MBA in Finance and Information Systems at Baruch College. From there I worked on Wall Street data teams, moved into customer success, and found my home in analytics engineering. Each step taught me something I still use: design sense for dashboards, how to teach a complex idea simply, and close attention to the people who rely on the data.',
    "Today I lead Data Science Enterprise Analytics at Insperity, where my team builds the models, pipelines, and reporting that senior leaders use to set strategy. I care as much about developing people as about building systems, and I've been fortunate to learn from many excellent managers along the way.",
  ],
  skills: [
    'SQL',
    'Python',
    'R',
    'Data Modeling',
    'dbt',
    'Snowflake',
    'Machine Learning',
    'AI Engineering',
    'Tableau',
    'Power BI',
    'Excel',
  ],
  sections: [
    {
      heading: 'Currently Learning',
      paragraphs: [
        "Most of my learning time right now goes to AI: using agents in my daily work and building my own. This site is one of those projects. I'm also strengthening my Python and R skills, so I stay hands-on with the work my team does every day.",
      ],
    },
    {
      heading: 'Beyond Work',
      paragraphs: [
        "A New Yorker by upbringing, I now live in the Florida panhandle with my husband and our three Yorkies. Away from the desk I'm usually running, cycling, or hiking, and I follow the Tour de France closely. I travel whenever I can; Ravenna, Italy is still my favorite. I'm also a lifelong car enthusiast, a loyal Buffalo Bills fan (a tradition passed down from my grandmother), and someone who has never met a dataset, at work or at home, that didn't deserve a dashboard.",
      ],
    },
  ],
}
