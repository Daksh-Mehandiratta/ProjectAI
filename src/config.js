// src/config.js — All app data & environment settings

const config = {
  app: {
    name: 'Project-AI',
    tagline: 'What can I help you with?',
    subtitle: 'How can I help you today?',
    disclaimer: 'Project-AI can make mistakes. Consider checking important information.',
    user: {
      name: 'User',
      plan: 'Free Plan',
      email: '',
      initials: 'U',
    },
    subscription: {
      plan: 'Free',
      resetDate: 'June 30, 2026',
    },
  },

  models: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B',  badge: 'Default', desc: 'Fast & highly capable'  },
    { id: 'llama3-8b-8192',          name: 'Llama 3 8B',      badge: 'Fast',    desc: 'Lightweight & quick'    },
    { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8x7B',    badge: 'Long',    desc: '32K context window'     },
    { id: 'gemma2-9b-it',            name: 'Gemma 2 9B',      badge: 'Google',  desc: 'Google open model'      },
  ],

  featureCards: [
    { id: 'write',    label: 'Write',    icon: 'PenLine',    desc: 'Create text content'            },
    { id: 'code',     label: 'Code',     icon: 'Code2',      desc: 'Generate code, debug, explain'  },
    { id: 'analyze',  label: 'Analyze',  icon: 'BarChart3',  desc: 'Analyze data, files, docs'      },
    { id: 'design',   label: 'Design',   icon: 'Image',      desc: 'Create images, UI ideas'        },
    { id: 'research', label: 'Research', icon: 'Search',     desc: 'Get information and insights'   },
    { id: 'summarize',label: 'Summarize',icon: 'FileText',   desc: 'Summarize long content'         },
  ],

  examplePrompts: [
    'Create a landing page',
    'Explain quantum computing',
    'Create a Python function',
    'Summarize this document',
    'Write a marketing email',
    'Debug my React code',
  ],

  sidebarNav: [
    { id: 'models',   label: 'Chat',     icon: 'MessageSquare' },
    { id: 'tools',    label: 'Tools',    icon: 'Wrench'        },
    { id: 'settings', label: 'Settings', icon: 'Settings'      },
  ],

  chatHistory: {
    today: [
      { id: 't1', text: 'Build a landing page',     time: '11:30 AM' },
      { id: 't2', text: 'React Navbar Component',   time: '10:12 AM' },
      { id: 't3', text: 'Python data analysis',     time: '09:15 AM' },
    ],
    yesterday: [
      { id: 'y1', text: 'Create a marketing plan',  time: '04:45 PM' },
      { id: 'y2', text: 'Write a blog post',        time: '02:30 PM' },
    ],
    previous: [
      { id: 'p1', text: 'Tailwind CSS tips',        time: 'Sun' },
      { id: 'p2', text: 'JavaScript functions',     time: 'Sat' },
      { id: 'p3', text: 'Machine learning basics',  time: 'Fri' },
    ],
  },

  theme: {
    defaultDark: false,
  },
}

export default config
