import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Chat from '../models/Chat.js';

dotenv.config();

export const seedDatabase = async (force = true) => {
  try {
    const existingCount = await User.countDocuments();
    if (!force && existingCount > 0) {
      console.log(`ℹ️ Database already has ${existingCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('🧹 Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Chat.deleteMany({}),
    ]);
    console.log('✅ Collections cleared.');

    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    console.log('👤 Creating initial user accounts with Indian developer profiles...');
    const users = await User.create([
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        username: 'aaravm',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Full Stack Tech Lead',
        bio: 'Tech lead based in Bengaluru. Building scalable Web3 & SaaS applications, real-time web engines, and open-source developer tooling.',
        skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Tailwind', 'MongoDB', 'Express', 'Docker'],
        experience: '6+ years',
        availability: 'Available',
        interests: ['Web Apps', 'Developer Tools', 'Open Source', 'AI/ML'],
        socialLinks: {
          github: 'https://github.com/aaravmehta',
          linkedin: 'https://linkedin.com/in/aaravmehta',
          portfolio: 'https://aaravmehta.dev',
        },
        githubUsername: 'aaravmehta',
        onboardingCompleted: true,
        badges: [
          { id: 'first_project', title: 'First Project', description: 'Created and completed your first project.', icon: '🚀', earnedAt: new Date('2026-01-15') },
          { id: 'team_leader', title: 'Team Leader', description: 'Successfully led a team or project.', icon: '⭐', earnedAt: new Date('2026-02-10') },
          { id: 'full_stack', title: 'Full Stack Developer', description: 'Demonstrated experience across frontend and backend development.', icon: '⚡', earnedAt: new Date('2026-03-01') },
          { id: 'active_member', title: 'Active Member', description: 'Consistently active and engaged on the platform.', icon: '🔥', earnedAt: new Date('2026-04-12') },
        ],
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        username: 'ananyaiyer',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Lead UI/UX & Frontend Architect',
        bio: 'Obsessed with accessibility, design systems, and fluid micro-interactions. Creating seamless digital product experiences from Chennai.',
        skills: ['React', 'Figma', 'Tailwind', 'CSS', 'Vue', 'Framer', 'TypeScript', 'HTML'],
        experience: '5 years',
        availability: 'Available',
        interests: ['UI/UX', 'Design Systems', 'Frontend', 'Accessibility'],
        socialLinks: {
          github: 'https://github.com/ananyaiyer',
          linkedin: 'https://linkedin.com/in/ananyaiyer',
          portfolio: 'https://ananyaiyer.design',
        },
        githubUsername: 'ananyaiyer',
        onboardingCompleted: true,
        badges: [
          { id: 'ui_expert', title: 'UI Expert', description: 'Demonstrated strong UI/UX and frontend development skills.', icon: '🎨', earnedAt: new Date('2026-02-20') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-03-15') },
        ],
      },
      {
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@example.com',
        username: 'rohand',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Backend Architect & Systems Engineer',
        bio: 'Building low-latency microservices, distributed caching, and event-driven backends in Pune. Lover of Rust, Python, and PostgreSQL.',
        skills: ['Node.js', 'Express', 'Python', 'Django', 'PostgreSQL', 'Docker', 'Redis', 'MongoDB'],
        experience: '7 years',
        availability: 'Part-time',
        interests: ['Backend', 'Database Architecture', 'Distributed Systems', 'Security'],
        socialLinks: {
          github: 'https://github.com/rohandeshmukh',
          linkedin: 'https://linkedin.com/in/rohandeshmukh',
        },
        githubUsername: 'rohandeshmukh',
        onboardingCompleted: true,
        badges: [
          { id: 'first_project', title: 'First Project', description: 'Created and completed your first project.', icon: '🚀', earnedAt: new Date('2026-01-05') },
          { id: 'bug_hunter', title: 'Bug Hunter', description: 'Found and resolved bugs in projects.', icon: '🐛', earnedAt: new Date('2026-03-22') },
          { id: 'open_source', title: 'Open Source Contributor', description: 'Contributed to an open-source project.', icon: '💻', earnedAt: new Date('2026-04-01') },
        ],
      },
      {
        name: 'Diya Kulkarni',
        email: 'diya.kulkarni@example.com',
        username: 'diyak',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'AI & Machine Learning Researcher',
        bio: 'AI engineer in Hyderabad fine-tuning LLMs, building custom RAG pipelines, and training NLP models for Indian regional languages.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP', 'FastAPI', 'Node.js', 'React'],
        experience: '4 years',
        availability: 'Available',
        interests: ['AI/ML', 'Data Science', 'Natural Language Processing'],
        socialLinks: {
          github: 'https://github.com/diyakulkarni',
          linkedin: 'https://linkedin.com/in/diyakulkarni',
        },
        githubUsername: 'diyakulkarni',
        onboardingCompleted: true,
        badges: [
          { id: 'active_member', title: 'Active Member', description: 'Consistently active and engaged on the platform.', icon: '🔥', earnedAt: new Date('2026-03-10') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-04-05') },
        ],
      },
      {
        name: 'Kabir Verma',
        email: 'kabir.verma@example.com',
        username: 'kabirv',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Mobile & Cross-Platform Developer',
        bio: 'Crafting responsive iOS & Android mobile apps with Flutter and React Native. Crafting smooth mobile UI and native device integrations.',
        skills: ['Flutter', 'React Native', 'Android', 'Kotlin', 'Swift', 'Firebase', 'JavaScript'],
        experience: '4 years',
        availability: 'Available',
        interests: ['Mobile', 'Flutter', 'Cross-Platform UI'],
        socialLinks: {
          github: 'https://github.com/kabirverma',
          linkedin: 'https://linkedin.com/in/kabirverma',
        },
        githubUsername: 'kabirverma',
        onboardingCompleted: true,
        badges: [
          { id: 'first_project', title: 'First Project', description: 'Created and completed your first project.', icon: '🚀', earnedAt: new Date('2026-02-14') },
          { id: 'bug_hunter', title: 'Bug Hunter', description: 'Found and resolved bugs in projects.', icon: '🐛', earnedAt: new Date('2026-03-30') },
        ],
      },
      {
        name: 'Neha Agarwal',
        email: 'neha.agarwal@example.com',
        username: 'nehaa',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Cloud Platform & DevOps Engineer',
        bio: 'Architecting high-availability Kubernetes clusters, automated CI/CD pipelines, and infrastructure-as-code scripts in NCR.',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'GitHub Actions', 'Go', 'Python'],
        experience: '5 years',
        availability: 'Part-time',
        interests: ['DevOps', 'Cloud Infrastructure', 'Automation', 'CI/CD'],
        socialLinks: {
          github: 'https://github.com/nehaagarwal',
          linkedin: 'https://linkedin.com/in/nehaagarwal',
        },
        githubUsername: 'nehaagarwal',
        onboardingCompleted: true,
        badges: [
          { id: 'open_source', title: 'Open Source Contributor', description: 'Contributed to an open-source project.', icon: '💻', earnedAt: new Date('2026-01-28') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-04-10') },
        ],
      },
      {
        name: 'Vikram Sengupta',
        email: 'vikram.sengupta@example.com',
        username: 'vikrams',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Cybersecurity & Systems Developer',
        bio: 'Kolkata-based security analyst & backend developer. Focused on penetration testing, OAuth protocol security, and memory-safe C++/Rust utilities.',
        skills: ['Go', 'Python', 'Docker', 'Linux', 'C++', 'Node.js'],
        experience: '5+ years',
        availability: 'Available',
        interests: ['Security', 'Backend', 'Open Source', 'Systems'],
        socialLinks: {
          github: 'https://github.com/vikramsengupta',
          linkedin: 'https://linkedin.com/in/vikramsengupta',
        },
        githubUsername: 'vikramsengupta',
        onboardingCompleted: true,
        badges: [
          { id: 'bug_hunter', title: 'Bug Hunter', description: 'Found and resolved bugs in projects.', icon: '🐛', earnedAt: new Date('2026-02-18') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-03-25') },
        ],
      },
      {
        name: 'Pooja Nambiar',
        email: 'pooja.nambiar@example.com',
        username: 'poojan',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Data Engineer & Pipeline Specialist',
        bio: 'Designing large-scale ETL data pipelines, real-time analytics streaming, and warehousing solutions in Kochi.',
        skills: ['Python', 'PostgreSQL', 'MongoDB', 'SQL', 'Redis', 'Docker'],
        experience: '4 years',
        availability: 'Available',
        interests: ['Database Architecture', 'AI/ML', 'Data Science'],
        socialLinks: {
          github: 'https://github.com/poojanambiar',
          linkedin: 'https://linkedin.com/in/poojanambiar',
        },
        githubUsername: 'poojanambiar',
        onboardingCompleted: true,
        badges: [
          { id: 'first_project', title: 'First Project', description: 'Created and completed your first project.', icon: '🚀', earnedAt: new Date('2026-01-20') },
          { id: 'active_member', title: 'Active Member', description: 'Consistently active and engaged on the platform.', icon: '🔥', earnedAt: new Date('2026-03-14') },
        ],
      },
      {
        name: 'Aditya Joshi',
        email: 'aditya.joshi@example.com',
        username: 'adityaj',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Frontend Performance Engineer',
        bio: 'Optimizing web vitals, bundle sizes, and rendering performance for high-traffic Web applications in Mumbai.',
        skills: ['React', 'Vue', 'JavaScript', 'CSS', 'TypeScript', 'Tailwind', 'HTML'],
        experience: '3+ years',
        availability: 'Available',
        interests: ['Frontend', 'UI/UX', 'Performance'],
        socialLinks: {
          github: 'https://github.com/adityajoshi',
          linkedin: 'https://linkedin.com/in/adityajoshi',
        },
        githubUsername: 'adityajoshi',
        onboardingCompleted: true,
        badges: [
          { id: 'ui_expert', title: 'UI Expert', description: 'Demonstrated strong UI/UX and frontend development skills.', icon: '🎨', earnedAt: new Date('2026-03-01') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-04-02') },
        ],
      },
      {
        name: 'Ishita Reddy',
        email: 'ishita.reddy@example.com',
        username: 'ishitar',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Microservices & Cloud Architect',
        bio: 'Building cloud-native SaaS enterprise solutions, GraphQL gateways, and fault-tolerant event streams in Hyderabad.',
        skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'MySQL', 'Node.js', 'React'],
        experience: '6 years',
        availability: 'Part-time',
        interests: ['Cloud Infrastructure', 'Backend', 'Web Apps'],
        socialLinks: {
          github: 'https://github.com/ishitareddy',
          linkedin: 'https://linkedin.com/in/ishitareddy',
        },
        githubUsername: 'ishitareddy',
        onboardingCompleted: true,
        badges: [
          { id: 'full_stack', title: 'Full Stack Developer', description: 'Demonstrated experience across frontend and backend development.', icon: '⚡', earnedAt: new Date('2026-02-11') },
          { id: 'team_leader', title: 'Team Leader', description: 'Successfully led a team or project.', icon: '⭐', earnedAt: new Date('2026-03-29') },
        ],
      },
      {
        name: 'Siddharth Nair',
        email: 'siddharth.nair@example.com',
        username: 'siddharthn',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Embedded IoT & Hardware Developer',
        bio: 'Bridging hardware and software. Building IoT edge gateways, ESP32 sensor networks, and real-time telemetry dashboards.',
        skills: ['C++', 'Python', 'Android', 'Go', 'Node.js'],
        experience: '4 years',
        availability: 'Available',
        interests: ['Systems', 'Mobile', 'Automation'],
        socialLinks: {
          github: 'https://github.com/siddharthnair',
          linkedin: 'https://linkedin.com/in/siddharthnair',
        },
        githubUsername: 'siddharthnair',
        onboardingCompleted: true,
        badges: [
          { id: 'first_project', title: 'First Project', description: 'Created and completed your first project.', icon: '🚀', earnedAt: new Date('2026-01-30') },
          { id: 'open_source', title: 'Open Source Contributor', description: 'Contributed to an open-source project.', icon: '💻', earnedAt: new Date('2026-03-05') },
        ],
      },
      {
        name: 'Kavya Patel',
        email: 'kavya.patel@example.com',
        username: 'kavyap',
        password: defaultPasswordHash,
        emailVerified: true,
        role: 'Product Designer & Full Stack Dev',
        bio: 'Ahmedabad-based developer who loves taking products from Figma wireframes to full-stack production deployments.',
        skills: ['React', 'Node.js', 'Figma', 'Tailwind', 'TypeScript', 'Express', 'MongoDB'],
        experience: '4+ years',
        availability: 'Available',
        interests: ['UI/UX', 'Full Stack', 'Product Development'],
        socialLinks: {
          github: 'https://github.com/kavyapatel',
          linkedin: 'https://linkedin.com/in/kavyapatel',
        },
        githubUsername: 'kavyapatel',
        onboardingCompleted: true,
        badges: [
          { id: 'ui_expert', title: 'UI Expert', description: 'Demonstrated strong UI/UX and frontend development skills.', icon: '🎨', earnedAt: new Date('2026-02-15') },
          { id: 'full_stack', title: 'Full Stack Developer', description: 'Demonstrated experience across frontend and backend development.', icon: '⚡', earnedAt: new Date('2026-03-18') },
          { id: 'team_player', title: 'Team Player', description: 'Successfully collaborated with other developers on a project.', icon: '🤝', earnedAt: new Date('2026-04-08') },
        ],
      },
    ]);

    const [aarav, ananya, rohan, diya, kabir, neha, vikram, pooja, aditya, ishita, siddharth, kavya] = users;
    console.log(`✅ Created ${users.length} Indian developer accounts.`);

    console.log('🚀 Creating 10 project listings across categories...');
    const projects = await Project.create([
      {
        title: 'AI Code Reviewer & Security Scanner',
        description: 'An open-source GitHub Action and web dashboard that uses LLMs to perform automated code reviews, catch potential security bugs, and suggest performance optimizations on every Pull Request.',
        requiredSkills: ['Python', 'React', 'AI/ML', 'Docker'],
        technologies: ['Python', 'React', 'FastAPI', 'OpenAI API', 'Docker', 'Tailwind'],
        teamSize: 5,
        createdBy: aarav._id,
        members: [aarav._id, diya._id, rohan._id],
        status: 'recruiting',
        category: 'AI/ML',
      },
      {
        title: 'DevFlow — Real-Time Kanban for Teams',
        description: 'A lightweight, ultra-fast project management board built for developer teams. Features real-time drag-and-drop task updates, GitHub integration, and built-in markdown documentation.',
        requiredSkills: ['React', 'Node.js', 'Socket.io', 'Tailwind'],
        technologies: ['React', 'Node.js', 'Express', 'Socket.io', 'MongoDB', 'Tailwind'],
        teamSize: 4,
        createdBy: ananya._id,
        members: [ananya._id, aarav._id, neha._id],
        status: 'in-progress',
        category: 'Web Apps',
      },
      {
        title: 'UPI PayGateway Mock & Analytics Suite',
        description: 'A developer sandbox tool that emulates Unified Payments Interface (UPI) flows, webhooks, and failure scenarios for testing e-commerce checkout code locally.',
        requiredSkills: ['Node.js', 'TypeScript', 'React', 'Express'],
        technologies: ['Node.js', 'TypeScript', 'React', 'Express', 'Redis'],
        teamSize: 4,
        createdBy: rohan._id,
        members: [rohan._id, ishita._id, aditya._id],
        status: 'recruiting',
        category: 'Developer Tools',
      },
      {
        title: 'EcoTrack — Carbon Footprint & Sustainability App',
        description: 'A cross-platform mobile app that helps users track their daily commute emissions, energy usage, and dietary carbon impact with gamified badges and monthly sustainability challenges.',
        requiredSkills: ['Flutter', 'Node.js', 'Firebase'],
        technologies: ['Flutter', 'Dart', 'Firebase', 'Node.js', 'Express'],
        teamSize: 4,
        createdBy: kabir._id,
        members: [kabir._id, ananya._id, diya._id],
        status: 'recruiting',
        category: 'Mobile',
      },
      {
        title: 'KubeGrid — Kubernetes Cluster Monitor',
        description: 'Visual dashboard for monitoring Kubernetes pod metrics, log streams, deployment rollouts, and resource node utilization in real time.',
        requiredSkills: ['Docker', 'Kubernetes', 'Go', 'React'],
        technologies: ['Go', 'React', 'Kubernetes', 'Docker', 'Prometheus'],
        teamSize: 5,
        createdBy: neha._id,
        members: [neha._id, vikram._id, pooja._id],
        status: 'in-progress',
        category: 'DevOps',
      },
      {
        title: 'Design System UI Kit for React & Tailwind',
        description: 'An accessible, customizable, and headless component library for React and Tailwind CSS. Includes 40+ accessible UI primitives with dark mode and custom theme builders.',
        requiredSkills: ['React', 'TypeScript', 'CSS', 'Tailwind'],
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        teamSize: 4,
        createdBy: ananya._id,
        members: [ananya._id, kavya._id, aditya._id],
        status: 'in-progress',
        category: 'Frontend',
      },
      {
        title: 'IndicLang NLP — Multilingual AI Translation Toolkit',
        description: 'Open source toolkit providing pre-trained NLP models for translating and tokenizing 12+ major Indian regional languages with high contextual accuracy.',
        requiredSkills: ['Python', 'Machine Learning', 'NLP', 'FastAPI'],
        technologies: ['Python', 'PyTorch', 'FastAPI', 'HuggingFace', 'Docker'],
        teamSize: 6,
        createdBy: diya._id,
        members: [diya._id, aarav._id, rohan._id],
        status: 'recruiting',
        category: 'AI/ML',
      },
      {
        title: 'RustSync — Ultra-Fast File Syncing Engine',
        description: 'High-performance distributed file synchronization tool written in Rust. Designed for syncing large datasets across server clusters with differential checksum updates.',
        requiredSkills: ['Rust', 'Docker', 'Go'],
        technologies: ['Rust', 'Go', 'Docker', 'gRPC'],
        teamSize: 4,
        createdBy: rohan._id,
        members: [rohan._id, neha._id, aarav._id, kabir._id],
        status: 'completed',
        category: 'Systems',
      },
      {
        title: 'FinPulse — Real-Time Algorithmic Trading Workbench',
        description: 'Web workbench for backtesting quantitative trading strategies, visualizing stock ticker candlestick charts, and executing simulated paper trades.',
        requiredSkills: ['Java', 'React', 'Node.js', 'PostgreSQL'],
        technologies: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'WebSockets'],
        teamSize: 5,
        createdBy: ishita._id,
        members: [ishita._id, pooja._id, vikram._id],
        status: 'recruiting',
        category: 'Web Apps',
      },
      {
        title: 'SmartHome IoT Edge Gateway',
        description: 'Embedded Linux gateway software for connecting smart sensors, controlling relays via MQTT protocols, and serving a local web dashboard.',
        requiredSkills: ['C++', 'Python', 'Android', 'Go'],
        technologies: ['C++', 'Python', 'MQTT', 'Go', 'Node.js'],
        teamSize: 4,
        createdBy: siddharth._id,
        members: [siddharth._id, kabir._id],
        status: 'recruiting',
        category: 'Systems',
      },
    ]);

    const [aiReviewer, devFlow, upiMock, ecoTrack, kubeGrid, designSystem, indicLang, rustSync, finPulse, iotGateway] = projects;
    console.log(`✅ Created ${projects.length} sample projects.`);

    console.log('📄 Submitting applications...');
    const applications = await Application.create([
      {
        userId: kabir._id,
        projectId: aiReviewer._id,
        status: 'pending',
        message: 'Hey Aarav! I would love to contribute to the AI Code Reviewer, specifically handling mobile push notifications for PR events.',
      },
      {
        userId: neha._id,
        projectId: aiReviewer._id,
        status: 'pending',
        message: 'Hi Aarav, I can set up the Dockerized CI/CD workflow and deployment scripts for the backend service.',
      },
      {
        userId: rohan._id,
        projectId: devFlow._id,
        status: 'pending',
        message: 'Hey Ananya! I can help build out the high-speed backend websocket handlers and state syncing.',
      },
      {
        userId: diya._id,
        projectId: ecoTrack._id,
        status: 'accepted',
        message: 'Hi Kabir! I can integrate the ML backend for carbon calculation estimates from user log data.',
      },
      {
        userId: aarav._id,
        projectId: upiMock._id,
        status: 'accepted',
        message: 'Hey Rohan, happy to help review and architect the TypeScript endpoint definitions for the sandbox API.',
      },
      {
        userId: kavya._id,
        projectId: indicLang._id,
        status: 'pending',
        message: 'Hi Diya, I can build the React demo interface for testing multilingual translation outputs side by side.',
      },
      {
        userId: aditya._id,
        projectId: kubeGrid._id,
        status: 'pending',
        message: 'Hey Neha! I can optimize the canvas graphs for rendering live CPU and memory metrics smoothly.',
      },
    ]);
    console.log(`✅ Created ${applications.length} project applications.`);

    console.log('💬 Creating chat messages...');
    await Chat.create([
      {
        projectId: devFlow._id,
        messages: [
          {
            sender: ananya._id,
            content: 'Welcome to the DevFlow team! I have initialized the main UI layout with Tailwind.',
            createdAt: new Date('2026-04-10T10:00:00Z'),
          },
          {
            sender: aarav._id,
            content: 'Looks awesome Ananya! I will hook up the Socket.io event listeners for live card updates today.',
            createdAt: new Date('2026-04-10T10:15:00Z'),
          },
          {
            sender: neha._id,
            content: 'Great! I am configuring the Docker compose environment for our Mongo and Redis services.',
            createdAt: new Date('2026-04-10T11:30:00Z'),
          },
        ],
      },
      {
        projectId: designSystem._id,
        messages: [
          {
            sender: ananya._id,
            content: 'Hey Kavya & Aditya, I pushed the button and modal primitive component specs to the repo.',
            createdAt: new Date('2026-04-12T14:20:00Z'),
          },
          {
            sender: kavya._id,
            content: 'Checked them out! Accessibility keyboard nav and focus rings look spot on.',
            createdAt: new Date('2026-04-12T14:45:00Z'),
          },
          {
            sender: aditya._id,
            content: 'I verified bundle size tree-shaking — staying under 4kb per component chunk!',
            createdAt: new Date('2026-04-12T15:10:00Z'),
          },
        ],
      },
    ]);
    console.log('✅ Created chat conversations.');

    console.log('🔔 Creating notifications...');
    await Notification.create([
      {
        userId: aarav._id,
        type: 'application_received',
        title: 'New Application',
        message: 'Kabir Verma applied to your project "AI Code Reviewer & Security Scanner"',
        projectId: aiReviewer._id,
        read: false,
      },
      {
        userId: aarav._id,
        type: 'application_received',
        title: 'New Application',
        message: 'Neha Agarwal applied to your project "AI Code Reviewer & Security Scanner"',
        projectId: aiReviewer._id,
        read: false,
      },
      {
        userId: kabir._id,
        type: 'application_accepted',
        title: 'Application Accepted!',
        message: 'Your application to "EcoTrack — Carbon Footprint & Sustainability App" was accepted.',
        projectId: ecoTrack._id,
        read: true,
      },
    ]);
    console.log('✅ Created initial notifications.');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('───────────────────────────────────────────────────────');
    console.log('🔑 12 TEST ACCOUNTS CREATED (Password: Password123!)');
    console.log('───────────────────────────────────────────────────────');
    users.forEach((u) => {
      console.log(`  • ${u.name} (@${u.username}) → Email: ${u.email}`);
    });
    console.log('───────────────────────────────────────────────────────\n');

    return true;
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    return false;
  }
};

export const autoSeedIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('🌱 Database is empty. Auto-seeding initial sample data...');
    await seedDatabase(false);
  }
};

// Run directly from CLI if invoked via node
if (process.argv[1]?.endsWith('seedDatabase.js')) {
  connectDB().then(async () => {
    await seedDatabase(true);
    process.exit(0);
  });
}
