export interface Role {
  title: string
  org: string
  dates: string
  highlights: string[]
}

export interface Degree {
  degree: string
  school: string
  dates: string
}

export interface CareerContent {
  roles: Role[]
  education: Degree[]
}

/** Career page content, newest first. The page renders entries in this order. */
export const career: CareerContent = {
  roles: [
    {
      title: 'Director, Data Science & Enterprise Analytics',
      org: 'Insperity',
      dates: 'Dec 2024 - Present',
      highlights: [
        'Lead analytics planning and delivery across Sales, Marketing, Service Operations, Product, and IT',
        'Partner on data science, machine learning, and AI initiatives company-wide, building models in Python and R',
        'Develop the leadership and technical skills of direct reports and data champions across the organization',
      ],
    },
    {
      title: 'Senior Salesforce Reporting Administrator, Enterprise Analytics',
      org: 'Insperity',
      dates: 'Dec 2023 - Dec 2024',
      highlights: [
        'Designed multi-source Salesforce CRM Analytics dashboards for senior and executive leadership',
        'Delivered end-to-end ad hoc analysis, from SQL queries to statistical analysis in R',
        'Cultivated data champions across departments',
      ],
    },
    {
      title: 'Customer Success Operations Manager',
      org: 'Heap',
      dates: 'Jun 2022 - Nov 2023',
      highlights: [
        'Built the Customer Success metrics dashboard end to end, from SQL to Tableau',
        'Created a multi-variable customer health score with a statistically significant correlation to renewal',
        'Led analysis of account early-warning signs that became an automated trigger system',
        'Owned churn and NPS reporting and quarterly recommendations for executive leadership',
      ],
    },
    {
      title: 'Analytics & Reporting Manager, Insights & Analytics',
      org: 'Insperity',
      dates: 'Oct 2018 - May 2022',
      highlights: [
        'Built multi-source dashboards and reporting packages for senior and executive leadership',
        'Automated database-to-dashboard refreshes with Power Automate',
        'Created capacity models to track team workload and forecast demand',
      ],
    },
    {
      title: 'Customer Success Manager',
      org: 'Insperity',
      dates: 'Jun 2016 - Oct 2018',
      highlights: [
        'Managed relationships for 250 strategic and enterprise clients',
        'Owned the largest organizational-planning client relationship, including its use of the tool for M&A',
      ],
    },
    {
      title: 'Operations Manager',
      org: 'Intrepid Financial Partners',
      dates: 'Mar 2016 - Jun 2016',
      highlights: [
        'Implemented and maintained Concur expense management and Salesforce CRM',
        'Assisted with preparation of financial statements',
      ],
    },
    {
      title: 'Software Implementer / Financial Advisor',
      org: 'Insperity Financial Solutions',
      dates: 'Dec 2013 - Mar 2016',
      highlights: [
        'Implemented expense management software for clients from 10 to 950 users, integrated with their general ledgers',
        'Found trends in client spend data that revealed savings and potential waste or fraud',
        'Managed up to thirteen concurrent projects with weekly milestones',
      ],
    },
    {
      title: 'Financial Analyst',
      org: 'Dynasplint Systems',
      dates: 'Dec 2011 - Dec 2013',
      highlights: [
        'Rolled out a company-wide expense program for 425 users, saving $65K a year in processing fees',
        'Found $77K in technology and shipping waste in 2012',
        'Uncovered expense fraud that had gone undetected for seven months',
        'Partnered with the CFO on monthly and quarterly financial statements',
      ],
    },
    {
      title: 'Data Specialist, Investment Banking Real Estate',
      org: 'Barclays Capital',
      dates: 'Aug 2010 - Dec 2011',
      highlights: [
        'Prepared and analyzed regional and global revenue reports',
        'Monitored deal staffing to ensure accurate revenue allocation',
        "Maintained the US team's deal pipeline and fee estimates",
      ],
    },
    {
      title: 'Executive Assistant to VP Sales & Marketing',
      org: 'Dynasplint Systems',
      dates: 'Dec 2008 - Jul 2010',
      highlights: [],
    },
    {
      title: 'Banking Assistant',
      org: 'Lehman Brothers',
      dates: 'May 2007 - Nov 2008',
      highlights: [],
    },
  ],
  education: [
    {
      degree: 'MBA, Finance & Information Systems',
      school: 'Baruch College, Zicklin School of Business',
      dates: '2013 - 2015',
    },
    {
      degree: 'BS, Education, Liberal Arts',
      school: 'SUNY New Paltz',
      dates: '2005 - 2007',
    },
    {
      degree: 'BFA, Art & Art History',
      school: 'Manhattanville College',
      dates: '2002 - 2005',
    },
  ],
}
