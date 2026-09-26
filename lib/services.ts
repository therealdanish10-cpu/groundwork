/**
 * Trelio IT Services — central data definitions.
 * Used by the home page, services listing, service detail pages,
 * and blog feed filtering.
 */

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  scope: string[];
  image: string;
  icon: string; // emoji for quick visual — replaced by real images in the UI
}

export const SERVICES: Service[] = [
  {
    slug: 'web-development',
    name: 'Web Development',
    tagline: 'Modern websites built for performance, security, and conversion',
    description:
      'We design and develop responsive, high-performance websites using cutting-edge technologies like React, Next.js, and Tailwind CSS. Every site is optimized for speed, accessibility, and search engine visibility — built to convert visitors into customers.',
    scope: [
      'Custom website design & development',
      'Responsive, mobile-first layouts',
      'Performance optimization & Core Web Vitals',
      'API integrations & third-party services',
      'E-commerce & payment gateway setup',
      'Ongoing maintenance & support',
    ],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    icon: '🌐',
  },
  {
    slug: 'seo',
    name: 'SEO',
    tagline: 'Rank higher. Get found. Drive sustainable organic revenue.',
    description:
      'Our data-driven SEO strategies help your business climb search rankings and attract qualified leads organically. We handle everything from technical audits to content optimization and link building — measurable results, no guesswork.',
    scope: [
      'Technical SEO audits & fixes',
      'On-page optimization & content strategy',
      'Keyword research & competitor analysis',
      'Local SEO & Google Business Profile',
      'Link building & authority growth',
      'Monthly reporting & analytics',
    ],
    image: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?w=800&auto=format&fit=crop&q=80',
    icon: '📈',
  },
  {
    slug: 'app-development',
    name: 'App Development',
    tagline: 'Native and cross-platform mobile apps engineered to scale',
    description:
      'From concept to launch, we build iOS and Android applications that deliver seamless user experiences. Whether you need a native app or a cross-platform solution, we engineer apps that scale with your business.',
    scope: [
      'iOS & Android native development',
      'Cross-platform apps (React Native, Flutter)',
      'UI/UX design & prototyping',
      'Backend API & database architecture',
      'App Store & Google Play deployment',
      'Post-launch support & updates',
    ],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
    icon: '📱',
  },
  {
    slug: 'social-media-management',
    name: 'Social Media Management',
    tagline: 'Build authority, engage your audience, and amplify your brand',
    description:
      'We create, schedule, and manage content across your social platforms to build brand awareness and drive engagement. Our team handles strategy, creative production, community management, and performance analytics.',
    scope: [
      'Content calendar & strategy',
      'Graphic design & video production',
      'Community engagement & response',
      'Platform-specific optimization',
      'Influencer outreach & partnerships',
      'Analytics & performance reporting',
    ],
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop&q=80',
    icon: '📣',
  },
  {
    slug: 'ai-automation',
    name: 'AI Automation',
    tagline: 'Automate manual workflows and scale smarter with intelligent systems',
    description:
      'Leverage artificial intelligence and automation to streamline operations, reduce costs, and unlock new capabilities. We integrate AI tools, build custom chatbots, and design automated workflows that let your team focus on high-value work.',
    scope: [
      'Custom AI chatbot development',
      'Workflow automation (Zapier, Make, custom)',
      'AI-powered content generation',
      'Data analysis & predictive models',
      'CRM & sales automation',
      'Process optimization consulting',
    ],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    icon: '🤖',
  },
  {
    slug: 'meta-ads',
    name: 'Meta Ads',
    tagline: 'High-ROI paid advertising campaigns across Facebook & Instagram',
    description:
      'We plan, launch, and optimize advertising campaigns across Meta platforms to drive leads, sales, and brand awareness. Our team manages every aspect — targeting, creative, budgets, and ongoing A/B testing for maximum return on ad spend.',
    scope: [
      'Campaign strategy & audience targeting',
      'Ad creative design & copywriting',
      'A/B testing & conversion optimization',
      'Retargeting & lookalike audiences',
      'Budget management & bid strategy',
      'Performance dashboards & ROI reporting',
    ],
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=80',
    icon: '🎯',
  },
  {
    slug: 'content-writing',
    name: 'Content Writing',
    tagline: 'Compelling copy that educates, persuades, and drives conversions',
    description:
      'Professional content writing that speaks to your audience and supports your marketing goals. From blog posts and landing pages to email campaigns and whitepapers — we deliver polished, SEO-friendly copy that drives results.',
    scope: [
      'Blog posts & articles',
      'Website copy & landing pages',
      'Email marketing sequences',
      'Case studies & whitepapers',
      'Social media content',
      'Brand voice & style guides',
    ],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    icon: '✍️',
  },
  {
    slug: 'wordpress-development',
    name: 'WordPress Development',
    tagline: 'Enterprise-grade custom WordPress solutions tailored to your brand',
    description:
      'Expert WordPress development for businesses that need a powerful, easy-to-manage website. We build custom themes, optimize performance, and set up the plugins and integrations you need — all with clean code and security best practices.',
    scope: [
      'Custom theme design & development',
      'Plugin development & integration',
      'WooCommerce setup & customization',
      'Performance & security optimization',
      'Migration from other platforms',
      'Ongoing maintenance & updates',
    ],
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    icon: '🔧',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
