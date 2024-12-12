import React, { useEffect, useState } from 'react'
import img from "../assets/oatmeal-cookies-honey-jar-isolated-pastel-background-copy-space_176841-82698.jpg"
import img1 from "../assets/history1.png"
import img2 from "../assets/The_history_of_ancient_Mexico_-_from_the_foundation_of_that_empire_to_its_destruction_by_the_Spaniards_(1832)_(14780941454).jpg"

import { onValue, ref } from 'firebase/database';
import { database } from '../FirebaseConfig';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const blogsRef = ref(database, 'blogs');
    onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      const blogList = data ? Object.entries(data).map(([id, blog]) => ({ id, ...blog })) : [];
      setBlogs(blogList);
    });
  }, []);


  return (
    <div>


      <section
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="absolute left-0 top-0 h-full w-full flex flex-col gap-4 justify-start items-start space-y-4">
          <img
            src={img1}
            alt="Ancient Beekeeping 1"
            className="w-full md:w-auto h-[384px] object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black opacity-25"></div>
        <div className="relative flex items-center justify-center h-full">
          <h1 className="text-white text-3xl md:text-5xl font-bold">Blogs</h1>
        </div>
      </section>

      <div className="2xl:p-10 flex flex-col justify-center items-center mx-auto 2xl:mt-10">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold italic text-center">
            Did you know that honey has been part of humans' diet for thousands of
            years?
          </h1>
        </div>
        <div className="md:px-10 px-4 mt-4 mx-auto items-center">
          <p className="text-md md:text-lg 2xl:text-xl text-center text-orange-900">
            Honey is the oldest foodstuff. It has been used as a major sweetener in
            the ancient world until sugarcane was cultivated. This is why since
            ancient times humankind introduced honey and honeybees with much gratitude
            for their value.
          </p>
        </div>
      </div>

      <div className="mx-auto py-10 px-4 md:px-10 lg:px-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => {
            // Pattern 1
            if (index % 6 === 0) {
              return (
                <div
                  key={blog.id}
                  className="col-span-1 md:col-span-3 md:grid md:grid-cols-3 gap-4"
                >
                  <div className="col-span-1 md:my-auto">
                    <img
                      src={blog.image}
                    
                      className="w-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-center p-4">
                    <h2 className="text-lg md:text-2xl font-bold">{blog.title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                </div>
              );
            }
            // Pattern 2
            else if (index % 6 === 1) {
              return (
                <div key={blog.id} className="col-span-1 md:col-span-2 row-span-2">
                  <img
                    src={blog.image}

                    className="w-full h-96   object-cover rounded-lg shadow-lg"
                  />
                  <div className="p-4">

                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                </div>
              );
            }
            // Pattern 3
            else if (index % 6 === 2) {
              return (
                <div key={blog.id} className="col-span-1">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-32 md:h-auto object-cover rounded-lg shadow-lg"
                  />
                  <div className="flex flex-col p-4">
                    <h2 className="text-lg md:text-xl font-bold">{blog.title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                </div>
              );
            }
            // Pattern 4 (Reverse of Pattern 1)
            else if (index % 6 === 3) {
              return (
                <div
                  key={blog.id}
                  className="col-span-1 md:col-span-3 md:grid md:grid-cols-3 gap-4"
                >
                  <div className="col-span-2 order-2 md:order-1 flex flex-col justify-center p-4">
                    <h2 className="text-lg md:text-2xl font-bold">{blog.title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                  <div className="col-span-1 order-1 md:order-2 md:my-auto">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              );
            }
            // Pattern 5 (Reverse of Pattern 2)
            else if (index % 6 === 4) {
              return (
                <div
                  key={blog.id}
                  className="col-span-1 md:col-span-2 row-span-2 relative"
                >
                  <img
                    src={blog.image}
                 
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                  />
                  <div className="p-4">
                    <h2 className="text-lg md:text-xl font-bold">{blog.title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                </div>
              );
            }
            // Pattern 6 (Reverse of Pattern 3)
            else if (index % 6 === 5) {
              return (
                <div key={blog.id} className="col-span-1">
                  <div className="flex flex-col p-4 bg-orange-200 rounded-lg shadow-lg">
                    <h2 className="text-lg md:text-xl font-bold">{blog.title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-2">
                      {blog.date}
                    </p>
                    <div
                      className="text-gray-700 text-sm md:text-base"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>


    </div>
  )
}

export default BlogPage