import { getServiceBySlug, SERVICES } from '@/lib/services';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/app/components/MotionWrapper';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.slug);
  
  if (!service) {
    return {
      title: 'Service Not Found | Trelio'
    };
  }

  const title = `${service.name} | Trelio Digital Services`;
  const description = service.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.trelio.tech/services/${service.slug}`,
      images: [
        {
          url: service.image || '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${service.name} - Trelio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [service.image || '/og-image.png'],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = getServiceBySlug(resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('service_tag', service.slug)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Hero Section */}
      <div className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <ScrollReveal className="flex-1">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">{service.name}</h1>
            <p className="text-xl text-[var(--blue)] font-medium mb-6">{service.tagline}</p>
            <p className="text-lg text-[var(--gray)] mb-8 max-w-xl">{service.description}</p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center bg-[var(--blue)] text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </ScrollReveal>
          <ScrollReveal className="flex-1 w-full" delay={0.2}>
            <div className="relative aspect-video lg:aspect-square w-full max-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)]">
              <Image
                src={service.image}
                alt={`${service.name} - Trelio digital service`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scope Section */}
      <div className="py-24 px-6 bg-[var(--bg)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="mb-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What We Do</h2>
            <p className="text-[var(--gray)] max-w-2xl mx-auto text-lg">
              Our comprehensive approach to {service.name.toLowerCase()} includes everything you need to succeed.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.scope?.map((item: string, index: number) => (
              <StaggerItem key={index}>
                <div className="flex items-start gap-4 p-6 bg-[var(--bg)] border border-[var(--border)] rounded-2xl h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--blue)]/10 flex items-center justify-center mt-0.5">
                    <svg className="w-5 h-5 text-[var(--blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {/* Blog Feed Section */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Related Insights</h2>
              <p className="text-[var(--gray)] text-lg">Latest articles about {service.name.toLowerCase()}.</p>
            </div>
            <Link href="/blog" className="hidden md:inline-flex text-[var(--blue)] font-semibold hover:underline">
              View All Articles &rarr;
            </Link>
          </ScrollReveal>

          {!blogs || blogs.length === 0 ? (
            <ScrollReveal className="py-12 text-center bg-[var(--bg)] border border-[var(--border)] rounded-2xl">
              <p className="text-[var(--gray)] text-lg">No articles yet.</p>
            </ScrollReveal>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <StaggerItem key={blog.id}>
                  <Link href={`/blog/${blog.slug}`} className="group block h-full">
                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--blue)] transition-colors h-full flex flex-col shadow-sm hover:shadow-md">
                      {blog.cover_image && (
                        <div className="relative h-48 w-full bg-[var(--border)] overflow-hidden">
                          <Image
                            src={blog.cover_image}
                            alt={blog.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--blue)] transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        {blog.excerpt ? (
                          <p className="text-[var(--gray)] text-sm line-clamp-3 mb-4">
                            {blog.excerpt}
                          </p>
                        ) : blog.content ? (
                          <p className="text-[var(--gray)] text-sm line-clamp-3 mb-4">
                            {blog.content.substring(0, 150).replace(/<[^>]+>/g, '')}...
                          </p>
                        ) : null}
                        <div className="mt-auto">
                          <span className="text-[var(--blue)] text-sm font-semibold group-hover:underline">Read Article</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/blog" className="inline-flex text-[var(--blue)] font-semibold hover:underline">
              View All Articles &rarr;
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 px-6 bg-[var(--bg)] text-center border-t border-[var(--border)]">
        <ScrollReveal className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-[var(--gray)] mb-8">
            Contact us today to discuss how our {service.name.toLowerCase()} services can help your business thrive.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center bg-[var(--blue)] text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Contact Us Now
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
