import React from 'react'
import ReactPaginate from 'react-paginate'

function Pagination({ pageCount, onPageChange }) {
  return (
    <div>
         <div className="flex justify-center mt-6 px-3 py-3">
         <ReactPaginate
                    previousLabel={<span className="text-lg">←</span>}
                    nextLabel={<span className="text-lg">→</span>}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    onPageChange={onPageChange}
                    containerClassName={"flex space-x-2"}
                    pageClassName={"px-4 py-2 bg-yellow-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                    activeClassName={"bg-brandyellow text-white"}
                    previousClassName={"px-4 py-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                    nextClassName={"px-4 py-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-all duration-300"}
                />
    </div>
    </div>
  )
}

export default Pagination