
"use client"
import { useEffect, useState } from "react";

interface Post {
  title: string;
  date: string;
  link: string;
  excerpt: string;
  image: string;
  tags: string[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Format date function to handle various date formats from Medium
  const formatDate = (dateString: string) => {
    try {
      // Try to parse common Medium date formats
      if (dateString.includes('Feb') || dateString.includes('Mar') ||
        dateString.includes('Apr') || dateString.includes('May') ||
        dateString.includes('Jun') || dateString.includes('Jul') ||
        dateString.includes('Aug') || dateString.includes('Sep') ||
        dateString.includes('Oct') || dateString.includes('Nov') ||
        dateString.includes('Dec') || dateString.includes('Jan')) {

        // If it's already in a readable format, return as is
        return dateString;
      }

      // Try to parse as ISO string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white text-2xl">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-400 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-white">
          All News
        </h1>

        {posts.length === 0 ? (
          <div className="text-center text-gray-400 text-xl">No posts found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPosts.map((post, idx) => (
                <div
                  key={idx}
                  className=" text-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image with fallback */}
                  <div className="h-56 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="border-[#686868] border-[2px] text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="bg-gray-700 text-xs px-3 py-1 rounded-full">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm mb-4">
                
                      {formatDate(post.date)}
                    </div>
                    </div>

                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold hover:text-blue-400 block mb-3 transition-colors"
                    >
                      {post.title}
                    </a>



                    <p className="text-[#CACACA] text-sm line-clamp-3 mb-5 leading-relaxed">
                      {post.excerpt}
                    </p>

                    
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 rounded-lg transition-colors ${currentPage === number
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}