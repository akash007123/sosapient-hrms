import React, { useState } from 'react';
import BlogHero from '../components/Blog/BlogHero';
import BlogSearch from '../components/Blog/BlogSearch';
import BlogGrid from '../components/Blog/BlogGrid';

const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technology', 'Design', 'Mobile Development', 'Web Development', 'AI/ML', 'Cybersecurity'];

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Web Development: Trends to Watch in 2025',
      description: 'Explore the latest trends shaping the future of web development, from AI integration to new frameworks and tools that are revolutionizing how we build applications.',
      excerpt: 'Explore the latest trends shaping the future of web development, from AI integration to new frameworks...',
      image: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'Akash Raikwar',
      authorImage: './blog/akash.jpg',
      date: '2025-06-13',
      readTime: '5 min read',
      category: 'Technology',
      tags: ['React', 'JavaScript', 'Web Development', 'Trends']
    },
    {
      id: 2,
      title: 'Building Scalable Mobile Apps: Best Practices and Strategies',
      description: 'Learn the essential strategies for building mobile applications that can scale with your growing user base and handle millions of users seamlessly.',
      excerpt: 'Learn the essential strategies for building mobile applications that can scale with your growing user base...',
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'Ritu Chouhan',
      authorImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      date: '2025-01-10',
      readTime: '7 min read',
      category: 'Mobile Development',
      tags: ['React Native', 'Flutter', 'Mobile', 'Scalability']
    },
    {
      id: 3,
      title: 'UI/UX Design Principles That Drive User Engagement',
      description: 'Discover the key design principles that create engaging user experiences and drive business success through thoughtful interface design.',
      excerpt: 'Discover the key design principles that create engaging user experiences and drive business success...',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'Mike Johnson',
      authorImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Design',
      tags: ['UI/UX', 'Design', 'User Experience', 'Interface']
    },
    {
      id: 4,
      title: 'Implementing AI in Modern Web Applications',
      description: 'A comprehensive guide to integrating artificial intelligence features into your web applications for enhanced user experience.',
      excerpt: 'A comprehensive guide to integrating artificial intelligence features into your web applications...',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'Emily Chen',
      authorImage: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      date: '2024-01-01',
      readTime: '8 min read',
      category: 'AI/ML',
      tags: ['AI', 'Machine Learning', 'Web Development', 'Innovation']
    },
    {
      id: 5,
      title: 'Cybersecurity Best Practices for Modern Applications',
      description: 'Essential security measures every developer should implement to protect applications and user data from cyber threats.',
      excerpt: 'Essential security measures every developer should implement to protect applications and user data...',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'David Rodriguez',
      authorImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      date: '2023-12-28',
      readTime: '9 min read',
      category: 'Cybersecurity',
      tags: ['Security', 'Cybersecurity', 'Best Practices', 'Protection']
    },
    {
      id: 6,
      title: 'The Rise of Progressive Web Apps (PWAs)',
      description: 'Understanding how Progressive Web Apps are bridging the gap between web and mobile applications.',
      excerpt: 'Understanding how Progressive Web Apps are bridging the gap between web and mobile applications...',
      image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1',
      author: 'Lisa Thompson',
      authorImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      date: '2023-12-20',
      readTime: '6 min read',
      category: 'Web Development',
      tags: ['PWA', 'Web Development', 'Mobile', 'Progressive']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-gray-900">
      <BlogHero />
      
      <BlogSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <BlogGrid
        posts={filteredPosts}
      />
    </div>
  );
};

export default Blog;