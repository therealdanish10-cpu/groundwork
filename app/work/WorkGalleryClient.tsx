'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { StaggerContainer, StaggerItem, LazyCard } from '@/app/components/MotionWrapper';

export interface GalleryProject {
  id: string;
  name: string;
  description: string;
  category: string | null;
  screenshot?: string | null;
  screenshot_url?: string | null;
  live_link?: string | null;
  live_link_url?: string | null;
  sort_order?: number;
  created_at?: string;
}

const CATEGORIES = [
  'All',
  'Web Development',
  'SEO',
  'App Development',
  'Social Media Management',
  'AI Automation',
  'Meta Ads',
  'Content Writing',
  'WordPress Development',
];

export default function WorkGalleryClient({
  initialProjects = [],
}: {
  initialProjects: GalleryProject[];
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute count of projects per category for clean badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialProjects.length };
    initialProjects.forEach((p) => {
      const cat = p.category?.trim();
      if (!cat) return;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [initialProjects]);

  // Filter projects based on active tab
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') {
      return initialProjects;
    }
    return initialProjects.filter((p) => {
      if (!p.category) return false;
      return p.category.trim() === selectedCategory;
    });
  }, [initialProjects, selectedCategory]);

  return (
    <div>
      {/* Category Filter Bar */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800/80 max-w-full">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            const count = categoryCounts[category] || 0;

            return (
              <button
                key={category}
                id={`tab-${category.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5
                  ${active
                    ? 'bg-[var(--blue)] text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800'
                  }
                `}
                aria-pressed={active}
              >
                <span>{category}</span>
                {count > 0 && (
                  <span
                    className={`
                      text-[10px] px-1.5 py-0.2 rounded-full font-extrabold transition-colors
                      ${active
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid or Clean Empty State */}
      {filteredProjects.length === 0 ? (
        <div data-empty-state className="text-center py-20 px-6 bg-gray-50 dark:bg-gray-900/60 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center text-3xl">
            📂
          </div>
          <h3 id="empty-category-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No projects in {selectedCategory} yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
            We are currently adding deliverables for this category. Check back soon or explore our full client portfolio.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="btn btn-primary text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            Show All Projects ({initialProjects.length})
          </button>
        </div>
      ) : (
        <StaggerContainer key={selectedCategory} className="grid gap-10 md:grid-cols-2">
          {filteredProjects.map((project, index) => {
            const imageUrl = project.screenshot || project.screenshot_url;
            const liveUrl = project.live_link || project.live_link_url;

            return (
              <LazyCard key={project.id} minHeight="420px" className="h-full">
                <StaggerItem index={index} className="h-full">
                  <article
                    data-project-card
                    data-category={project.category}
                    className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={project.name}
                          fill
                          priority={index < 2}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--blue)]/10">
                          <span className="text-[var(--blue)] font-bold text-xl">{project.name}</span>
                        </div>
                      )}
                      {project.category && (
                        <div className="absolute top-5 left-5 z-10">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          {project.name}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      {liveUrl && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:bg-[var(--blue)] hover:text-white hover:border-[var(--blue)] dark:hover:bg-[var(--blue)] dark:hover:border-[var(--blue)] transition-all w-full sm:w-auto gap-2"
                          >
                            <span>View Live Project</span>
                            <span>↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              </LazyCard>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
