import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import ReactPaginate from 'react-paginate';

function Student() {

    const apiUrl = "https://jsonplaceholder.typicode.com/posts";
    const [post_Id, setpost_Id] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    //Pagination
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    //Api call
    const [getPostData, setGetPostData] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        try {
            axios.get(apiUrl).then((response) => {
                if (response.status === 200) {
                    setIsLoading(false);
                    setGetPostData(response.data);
                    //Pagination
                    const calculatedTotalPages = Math.ceil((response.data.length) / itemsPerPage);
                    setTotalPages(calculatedTotalPages);
                }
            });
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }

    }, []);

    //Pagination
    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage);
    };

    let offset = currentPage * itemsPerPage;

    const currentPageData = getPostData.slice(offset, offset + itemsPerPage);

    //Edit Post using apiUrl
    const editPost = (id) => {
        setIsLoading(true);
        // Check if data is iterable (an array)
        if (Array.isArray(getPostData)) {

            const editPostId = getPostData.find((post) => post.id === id);

            if (editPostId) {
                setpost_Id(editPostId.id)
                setTitle(editPostId.title);
                setBody(editPostId.body);
            } else {
                console.error('Post with id', id, 'not found in getPostData');
            }
        } else {
            // getPostData is not an array
            console.error('getPostData is not an array');
        }
        setIsLoading(false);
    };

    //Update Post from apiUrl
    const saveToUpdate = () => {
        setIsLoading(true);
        setGetPostData((gettingPostData) => {
            return gettingPostData.map((updatingPostData) => {
                if (updatingPostData.id === post_Id) {
                    //  if success then call listing api again
                    try {
                        axios.get('https://jsonplaceholder.typicode.com/posts').then(updateResp => {
                            if (updateResp.status === 200) {
                                setGetPostData(updateResp.data);
                            } else {
                                console.error('Error fetching data from listing API:', updateResp);
                            }
                        }).catch(erro => {
                            console.log('Post listing error', erro);
                        });
                    } catch (error) {
                        console.error("Error:", error);
                    }
                }
                return updatingPostData; // Return the element as is or modified
            });
        });
        setIsLoading(false);
    };

    //Delete Post from apiUrl
    const deletePost = (Id) => {
        setIsLoading(true);
        try {
            axios.delete(`https://jsonplaceholder.typicode.com/posts/${Id}`).then((response) => {

                if (response.status === 200) {
                    console.log(`Deleted post with ID ${Id}`);
                    //  if success then call listing api again
                    try {
                        axios.get('https://jsonplaceholder.typicode.com/posts').then(resp => {
                            if (resp.status === 200) {
                                setGetPostData(resp.data);
                            } else {
                                console.error('Error fetching data from listing API:', response);
                            }
                        }).catch(err => {
                            console.log('Post listing error', err);
                        });
                    } catch (error) {
                        console.error("Error:", error);
                    }

                } else {
                    console.error('Error fetching data:', response);
                }
            }).finally(() => {
                setIsLoading(false); // Set isLoading to false after API call
            });
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }

    }

    return (
        <div className="container">
            {isLoading && <Spinner />}
            {!isLoading && <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">title</th>
                        <th scope="col">body</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPageData.map((post, i) => (
                        <tr key={i}>
                            <td>{post.id}</td>
                            <td>{post.title}</td>
                            <td>{post.body}</td>
                            <td className="d-flex">
                                <button type="button" className="btn btn-primary" onClick={() => editPost(post.id)} data-bs-toggle="modal" data-bs-target="#exampleModalCenter" >Edit</button>
                                <button type="button" className="btn btn-primary mx-1" onClick={() => deletePost(post.id)} >Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> }
            {/* Bootstrap Model */}
            <div className="modal fade" id="exampleModalCenter" tabIndex="-1" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalCenterTitle">Modal title</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="id" className="form-label">ID: {post_Id}</label>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Title</label>
                                <input type="text" className="form-control" id="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="body" className="form-label">Body</label>
                                <input type="text" className="form-control" id="body" placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={saveToUpdate}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            <ReactPaginate
                pageCount={totalPages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={(selectedItem) => handlePageChange(selectedItem.selected)}
                containerClassName={'pagination container d-flex justify-content-center align-items-center'}
                activeClassName={'active'}
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'page-item'}
                nextClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextLinkClassName={'page-link'}
                disabledClassName={'disabled'}
                className=''
            />
        </div>
    );
}

export default Student;
