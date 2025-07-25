import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Tag,
  Check,
  Bookmark,
  ThumbsUp,
  Eye,
  ChevronRight
} from 'lucide-react';

const BlogPost: React.FC = () => {
  const { id } = useParams();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(42);

  // Mock blog post data - in a real app, this would come from an API
  const blogPost = {
    id: 1,
    title: "The Future of Web Development: Trends to Watch in 2025",
    excerpt: "Explore the cutting-edge technologies and methodologies that will shape web development in 2025 and beyond.",
    content: `
      <h3>Web development is evolving at a breathtaking pace, driven by advances in technology, user expectations, and the need for seamless digital experiences. As we step into 2025, developers, businesses, and tech enthusiasts are keeping a keen eye on the innovations shaping the web. This blog explores the most promising and transformative web development trends to watch in 2025, helping you stay ahead of the curve.</h3>
      <br/>
      <h2><b>1. AI-Powered Web Development</b></h2>
      <p>Artificial Intelligence is not just a buzzword anymore—it's at the core of modern web experiences. In 2025, AI is expected to revolutionize how websites are built, personalized, and interacted with.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li><strong>AI code generation tools</strong> like GitHub Copilot and ChatGPT Code Interpreter are reducing development time.</li>
        <li><strong>AI-powered testing tools</strong> can auto-detect UI bugs and optimize performance.</li>
        <li><strong>Personalized user experiences</strong> using AI and machine learning (ML) to analyze behavior and preferences in real time.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Web developers must become comfortable integrating AI/ML APIs, understanding basic model outputs, and optimizing websites to behave more intelligently.</p>
      <br/>
      <h2><b>2. WebAssembly (WASM) Goes Mainstream</b></h2>
      <p>WebAssembly (WASM) allows code written in languages like C++, Rust, or Go to run at near-native speed in the browser. WASM is reshaping the boundaries of web performance and enabling complex applications like video editing, gaming, and simulations directly in the browser.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>More adoption of WASM for performance-critical apps.</li>
        <li>Frameworks like Blazor (C#) and Yew (Rust) will gain traction.</li>
        <li>Developers will combine JavaScript and WASM for hybrid applications.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Developers will need to understand when and how to use WASM effectively alongside traditional web technologies.</p>
      <br/>
      <h2><b>3. JAMstack & Headless Architecture Domination</b></h2>
      <p>The shift toward JAMstack (JavaScript, APIs, Markup) and headless CMSs is becoming standard. This architecture provides better performance, scalability, and security.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Headless CMS platforms like Strapi, Sanity, and Contentful will dominate content delivery.</li>
        <li>Static Site Generators (SSGs) like Next.js, Gatsby, and Hugo will gain more traction.</li>
        <li>Microservices and composable architecture will replace monolithic systems.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Full-stack developers must be comfortable with decoupled frontends and backend services, understanding how to stitch together APIs and micro-frontends.</p>
      <br/>
      <h2><b>4. Serverless and Edge Computing</b></h2>
      <p>Serverless computing is transforming the backend by abstracting away server management. Edge computing, on the other hand, processes data closer to the user, reducing latency and improving performance.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Widespread adoption of platforms like Vercel, Netlify, Cloudflare Workers, and AWS Lambda.</li>
        <li>More use of Function-as-a-Service (FaaS).</li>
        <li>Increased deployment of edge functions for real-time personalization.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Web developers will need to write stateless functions, manage distributed architecture, and understand edge regions and data locality.</p>
      <br/>
      <h2><b>5. The Rise of Web3 and Decentralized Apps (DApps)</b></h2>
      <p>Web3, the decentralized internet powered by blockchain, is slowly integrating with mainstream web development.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Increased use of blockchain-based authentication (wallet login).</li>
        <li>DApps with smart contracts on platforms like Ethereum, Solana, or Polygon.</li>
        <li>Decentralized storage using IPFS or Arweave.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Developers may need to learn Solidity, Web3.js, or Ethers.js, and understand how to securely integrate blockchain into traditional apps.</p>
      <br/>
      <h2><b>6. Motion UI and Micro-Interactions</b></h2>
      <p>User experience (UX) is becoming more dynamic, thanks to smooth animations and micro-interactions that guide and delight users.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Increased use of tools like Framer Motion, GSAP, and Lottie for performance-optimized animations.</li>
        <li>UX emphasis on accessibility-friendly motion design.</li>
        <li>Minimalist animation to complement performance goals.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Frontend developers and designers need to collaborate closely and focus on animation that enhances UX without overwhelming it.</p>
      <br/>
      <h2><b>7. Voice and Conversational Interfaces</b></h2>
      <p>As voice search and smart assistants grow in popularity, websites are adapting with voice-enabled and chatbot-integrated interfaces.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Voice UI integration using tools like Web Speech API or Dialogflow.</li>
        <li>Smarter chatbots powered by natural language processing (NLP) and LLMs (like GPT).</li>
        <li>Multi-modal experiences—voice, chat, and click—working in harmony.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Developers will need to understand how to handle speech input/output, voice accessibility, and NLP integration.</p>
      <br/>
      <h2><b>8. The Evolution of Responsive & Adaptive Design</b></h2>
      <p>With foldable phones, smartwatches, and more devices, responsive design must go beyond just screen size. It now means context-aware design.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Container queries in CSS for more granular control.</li>
        <li>CSS subgrid, scroll timelines, and view transitions becoming standard.</li>
        <li>Focus on performance-driven design and dark mode UX.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Frontend engineers need to master new CSS standards and adapt layouts for both flexibility and speed.</p>
      <br/>
      <h2><b>9. Cybersecurity and Privacy-First Development</b></h2>
      <p>As users grow more privacy-conscious, laws like GDPR, CCPA, and newer regional frameworks are forcing developers to embed privacy from the ground up.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Mandatory data encryption, user consent, and minimal tracking.</li>
        <li>Use of zero-trust architecture and token-based authentication (JWT, OAuth).</li>
        <li>Proactive penetration testing and secure-by-default coding.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Security must be a core skill for all developers, with DevSecOps practices embedded in the CI/CD pipeline.</p>
      <br/>
      <h2><b>10. Sustainable Web Development</b></h2>
      <p>With digital sustainability in focus, developers are optimizing code and infrastructure to reduce energy usage and environmental impact.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Use of lightweight frameworks, fewer dependencies.</li>
        <li>Image and asset optimization as standard.</li>
        <li>Hosting on green web platforms like GreenGeeks, Google Cloud (sustainability-focused).</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Sustainability will impact architectural decisions, SEO, and user experience.</p>
      <br/>
      <h2><b>11. Rise of Low-Code/No-Code Platforms</b></h2>
      <p>Low-code tools like Webflow, Bubble, and OutSystems are empowering non-technical users to build applications and prototypes quickly.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Startups using no-code MVPs to test ideas.</li>
        <li>Developers using low-code platforms for admin panels and internal tools.</li>
        <li>Hybrid teams of devs and designers collaborating on visual builders.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Developers will need to work with and sometimes maintain these platforms, while focusing their skills on custom logic, integrations, and scalability.</p>
      <br/>
      <h2><b>12. Continued Popularity of JavaScript and Its Ecosystem</b></h2>
      <p>JavaScript remains king, but it's evolving with better tooling, frameworks, and patterns.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Growth of React 19, Next.js 14, SolidJS, and Qwik for ultra-fast rendering.</li>
        <li>TypeScript becoming standard in enterprise and open-source.</li>
        <li>Frameworks focusing on server components, streaming, and partial hydration.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Keeping up with modern JavaScript frameworks and compiler-level enhancements will be crucial for relevance.</p>
      <br/>
      <h2><b>13. Real-Time Web Applications</b></h2>
      <p>Real-time collaboration, live updates, and instant interactions are becoming expected features across web apps.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Use of WebSockets, Server-Sent Events (SSE), and GraphQL subscriptions.</li>
        <li>Real-time dashboards, games, chats, and collaborative tools.</li>
        <li>Integration with Firebase, Supabase, or custom backend with Socket.IO.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Mastery of real-time communication and event-driven programming is becoming essential.</p>
      <br/>
      <h2><b>14. Progressive Web Apps (PWAs) Reimagined</b></h2>
      <p>PWAs blend web and mobile experiences. With deeper OS integration and better offline support, they continue to gain relevance.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>PWAs with native-like features: notifications, background sync, and installability.</li>
        <li>Wider support from Apple for iOS PWAs.</li>
        <li>One codebase for web, desktop (via Electron/Tauri), and mobile (via Capacitor/React Native Web).</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>PWAs are a cost-effective, performant way to reach users on all devices—especially in developing markets.</p>
      <br/>
      <h2><b>15. Developer Experience (DX) as a Priority</b></h2>
      <p>With increasing complexity, tools and workflows are becoming more focused on improving the developer experience.</p>
      <br/>
      <h3><b>What to Expect:</b></h3>
      <ul>
        <li>Better tooling (Vite, Turbopack, Bun) and package managers (pnpm, yarn).</li>
        <li>More intuitive error messages and hot reload environments.</li>
        <li>DX-focused platforms like StackBlitz, CodeSandbox, and GitHub Codespaces becoming standard.</li>
      </ul>
      <br/>
      <h3><b>Implication:</b></h3>
      <p>Developers will choose tools not just for power, but for comfort and productivity.</p>
      <br/>
      <h2><b>Conclusion</b></h2>
      <p>2025 promises to be a transformative year for web development. With AI, edge computing, WebAssembly, and Web3 reshaping the web, developers will need to remain adaptive, curious, and user-focused.</p>
      <br/>
      <p>The future isn't just about adopting the latest tools, but about solving human problems through efficient, ethical, and scalable technology.</p>
      <br/>
      <p>Whether you're a beginner or a seasoned engineer, staying aligned with these trends will ensure you're building not just websites—but experiences that matter.</p>
    `,
    image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    author: "Akash Raikwar",
    authorImage: "../blog/akash.jpg",
    date: "2025-06-13",
    readTime: "8 min read",
    category: "Web Development",
    tags: ["Web Development", "Technology", "Future Trends", "AI", "WebAssembly"],
    views: 1234
  };

  const relatedPosts = [
    {
      id: 2,
      title: 'Building Scalable Mobile Apps: Best Practices',
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
      date: '2024-01-10',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'UI/UX Design Principles That Drive Engagement',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
      date: '2024-01-05',
      readTime: '6 min read'
    }
  ];

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = blogPost.title;
    const text = blogPost.excerpt;
    const hashtags = blogPost.tags.map(tag => tag.replace(/\s+/g, '')).join(',');

    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`;
          break;
      }
      window.open(shareUrl, '_blank', 'width=600,height=400');
    } else if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${text}\n\nRead more at: ${url}`,
          url,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <>
    <Helmet>
  <title>{blogPost.title} | Web Development Trends 2025</title>
  <meta name="description" content={blogPost.excerpt} />
  
  {/* Standard meta tags */}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="author" content={blogPost.author} />
  <meta name="robots" content="index, follow" />
  <meta name="keywords" content={blogPost.tags.join(', ') + ', web development trends, future of web, 2025 technology'} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={blogPost.title} />
  <meta property="og:description" content={blogPost.excerpt} />
  <meta property="og:image" content={blogPost.image} />
  <meta property="og:url" content={window.location.href} />
  <meta property="og:site_name" content="Your Blog Name" />
  <meta property="article:published_time" content={new Date(blogPost.date).toISOString()} />
  <meta property="article:author" content={blogPost.author} />
  <meta property="article:section" content={blogPost.category} />
  {blogPost.tags.map(tag => (
    <meta property="article:tag" content={tag} key={tag} />
  ))}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={blogPost.title} />
  <meta name="twitter:description" content={blogPost.excerpt} />
  <meta name="twitter:image" content={blogPost.image} />
  <meta name="twitter:creator" content="@yourtwitterhandle" />
  <link rel="canonical" href={window.location.href} />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blogPost.title,
      "description": blogPost.excerpt,
      "image": blogPost.image,
      "author": {
        "@type": "Person",
        "name": blogPost.author,
        "url": "https://yourwebsite.com/about" 
      },
      "datePublished": new Date(blogPost.date).toISOString(),
      "dateModified": new Date(blogPost.date).toISOString(),
      "publisher": {
        "@type": "Organization",
        "name": "Your Blog Name",
        "logo": {
          "@type": "ImageObject",
          "url": "https://yourwebsite.com/logo.png" 
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "wordCount": blogPost.content.split(' ').length,
      "timeRequired": blogPost.readTime
    })}
  </script>
</Helmet>
    
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[60vh] min-h-[500px] w-full overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src={blogPost.image}
            alt={blogPost.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        </div>
        
        <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                {blogPost.category}
              </span>
              <span className="text-white/80 text-sm flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {blogPost.readTime}
              </span>
              <span className="text-white/80 text-sm flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {blogPost.views.toLocaleString()} views
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              {blogPost.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              {blogPost.excerpt}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/blog"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blog</span>
            </Link>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare()}
                className={`p-2 rounded-lg transition-colors ${
                  shareSuccess
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {shareSuccess ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Author Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
        >
          <img
            src={blogPost.authorImage}
            alt={blogPost.author}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{blogPost.author}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(blogPost.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {blogPost.readTime}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm flex items-center"
              >
                <Tag className="w-4 h-4 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Share this article
          </h3>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('facebook')}
              className="p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('twitter')}
              className="p-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1DA1F2]/90 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('linkedin')}
              className="p-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0A66C2]/90 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Related Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Related Articles
            </h3>
            <Link
              to="/blog"
              className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Related Article Cards */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src="https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Related article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-sm text-primary-500 dark:text-primary-400">
                  Web Development
                </span>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  The Rise of AI in Web Development
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  How artificial intelligence is transforming the way we build websites...
                </p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Related article"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-sm text-primary-500 dark:text-primary-400">
                  Technology
                </span>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                  WebAssembly: The Future of Web Performance
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Exploring how WebAssembly is revolutionizing web application performance...
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </article>
    </div>
    </>
  );
};

export default BlogPost;