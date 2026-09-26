import { createClient } from '@/lib/supabase/server'
import { SERVICES } from '@/lib/services'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { StaggerContainer, StaggerItem, ScrollReveal } from '@/app/components/MotionWrapper'

export const metadata: Metadata = {
  title: 'Blog | Trelio IT Services',
  description: 'Insights, guides, and industry news from the Trelio team.',
}

export const revalidate = 3600 // Revalidate every hour

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: posts, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
              Blog
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Insights, guides, and industry news
            </p>
          </div>
        </ScrollReveal>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl">
            <h3 className="text-2xl font-semibold text-foreground">No posts yet</h3>
            <p className="mt-2 text-muted-foreground">Check back soon for our latest insights and updates.</p>
          </div>
        ) : (
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const service = SERVICES.find(s => s.slug === post.service_tag)
              const serviceName = service ? service.name : post.service_tag

              return (
                <StaggerItem key={post.id}>
                  <div className="flex flex-col h-full overflow-hidden bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow group">
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                          <span className="text-primary font-medium">Trelio</span>
                        </div>
                      )}
                      {serviceName && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm shadow-sm">
                            {serviceName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="block mt-2">
                        <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="mt-3 text-base text-muted-foreground line-clamp-3">
                        {post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''}
                      </p>
                      <div className="mt-auto pt-6">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-primary font-medium hover:text-primary/80 inline-flex items-center gap-1 group/link"
                        >
                          Read more
                          <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
