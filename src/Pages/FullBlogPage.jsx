import React, { useEffect, useState } from 'react'
import img from "../assets/oatmeal-cookies-honey-jar-isolated-pastel-background-copy-space_176841-82698.jpg"
import img1 from "../assets/bee1.png"

import { useParams } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { get, ref } from 'firebase/database';

function FullBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogRef = ref(database, `blogs/${id}`);
        const snapshot = await get(blogRef);
        if (snapshot.exists()) {
          setBlog(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching blog details:", error);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) {
    return <p>Loading...</p>;
  }
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header section with gradient overlay */}
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-70"></div>
        <h1 className="relative text-white text-5xl font-extrabold tracking-wider uppercase drop-shadow-lg p-3 md:p-0">
          Blog Article
        </h1>
      </section>

      <div className='md:p-20'>
        <div className="p-3 md:p-16 max-w-5xl mx-auto mt-10 rounded-lg shadow-2xl border-t-2 border-gray-600 ">
          
          <div className="p-6 mb-4 text-center border-b border-gray-200">
           
            <p className="text-sm text-gray-400">{blog.date}</p>
          </div>

      
          <div className="rounded-lg flex justify-center mb-8">
            <img
              src={blog.image}
            
              className="w-3/4 h-auto rounded-xl "
            />
          </div>

      
          <div className="text-gray-700 text-lg leading-relaxed space-y-6 px-6">
            <div
              dangerouslySetInnerHTML={{ __html: blog.description }}
              className="prose prose-lg max-w-none"
            ></div>
          </div>
        </div>
        </div>
      </div>
      )
}

      export default FullBlogPage