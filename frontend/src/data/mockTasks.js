export const MOCK_TASKS = [
  {
    id: 1,
    title: 'Hackathon Submission',
    description: 'Finalize dev server hosting, complete the showcase video recording, and submit the project URL.',
    risk: 91,
    deadline: 'Tomorrow',
    tag: 'Design',
    completed: false,
    reasoning: [
      'Overlapping meeting conflicts (3.5 hours of meetings tomorrow).',
      'Slow historical completion rate on video-editing items (takes 1.8x longer than estimated).',
      'Only 14 hours remaining until the hard cutoff.'
    ]
  },
  {
    id: 2,
    title: 'API Integration',
    description: 'Integrate billing microservice with Stripe API webhook endpoints and configure error retry queues.',
    risk: 67,
    deadline: 'In 2 days',
    tag: 'Dev',
    completed: false,
    reasoning: [
      'Stripe sandbox testing response latency.',
      'Requires approval on security compliance checklists.'
    ]
  },
  {
    id: 3,
    title: 'Resume Review',
    description: 'Prepare detailed feedback notes on candidates A and B for the Senior Developer role.',
    risk: 34,
    deadline: 'In 3 days',
    tag: 'Career',
    completed: false,
    reasoning: [
      'Straightforward assessment format.',
      'Ample white space on Wednesday afternoon calendar.'
    ]
  },
  {
    id: 4,
    title: 'Data Analysis Report',
    description: 'Extract cohort retention statistics and format growth tables for Q1 performance deck.',
    risk: 55,
    deadline: 'In 4 days',
    tag: 'School',
    completed: false,
    reasoning: [
      'Medium data density.',
      'Minor risk of query queue lockups during cluster syncs.'
    ]
  },
  {
    id: 5,
    title: 'Database Schema Migration',
    description: 'Run production zero-downtime index migration for user-profile lookup speed improvements.',
    risk: 82,
    deadline: 'In 5 days',
    tag: 'Dev',
    completed: false,
    reasoning: [
      'High-risk infrastructure action with possibility of locking primary key lookups.',
      'Coordinating with devops windows outside of active user peaks.'
    ]
  },
  {
    id: 6,
    title: 'Competitor Analysis',
    description: 'Research feature roadmaps and product positioning of top 3 productivity agents.',
    risk: 15,
    deadline: 'Next week',
    tag: 'Business',
    completed: false,
    reasoning: [
      'Low task complexity.',
      'Long-term deadline with high calendar availability.'
    ]
  },
  {
    id: 7,
    title: 'UX Testing Session',
    description: 'Analyze recorded interview tapes from 5 customer trial runs on dashboard design.',
    risk: 42,
    deadline: 'Next week',
    tag: 'Design',
    completed: true,
    reasoning: [
      'Finished early during Friday focus block.'
    ]
  },
  {
    id: 8,
    title: 'Write Auth Documentation',
    description: 'Draft OpenAPI specifications and setup instructions for the authorization microservice.',
    risk: 20,
    deadline: 'Next week',
    tag: 'Dev',
    completed: true,
    reasoning: [
      'Documented and merged into master repo early.'
    ]
  }
]
