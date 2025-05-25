import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listUserChats, createChat } from '../actions/chatActions';
import { FaArrowLeft } from 'react-icons/fa';

const ChatListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Use a default empty object for chatList if it's undefined
  const chatList = useSelector((state) => state.chatList) || {
    loading: false,
    error: null,
    chats: [],
  };
  const { loading, error, chats = [] } = chatList;

  // Use a default empty object for chatCreate if it's undefined
  const chatCreate = useSelector((state) => state.chatCreate) || {};
  const { success: successCreate = false } = chatCreate;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(listUserChats());
    }
  }, [dispatch, navigate, userInfo, successCreate]);

  const createChatHandler = () => {
    dispatch(createChat()).then((data) => {
      if (data && data._id) {
        navigate(`/chat/${data._id}`);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      {/* Go Back Link */}
      <Link to='/' className='btn btn-light my-3'>
        <FaArrowLeft className='me-2' /> Go Back
      </Link>

      <Row className='align-items-center'>
        <Col>
          <h1>Test Report Analysis</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createChatHandler}>
            <i className='fas fa-plus'></i> New Analysis
          </Button>
        </Col>
      </Row>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {!chats || chats.length === 0 ? (
            <Message>
              No test report analyses yet.{' '}
              <Button variant='primary' onClick={createChatHandler}>
                Start a new analysis
              </Button>
            </Message>
          ) : (
            <Table striped bordered hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TITLE</th>
                  <th>DATE</th>
                  <th>MESSAGES</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {chats.map((chat) => (
                  <tr key={chat._id}>
                    <td>{chat._id}</td>
                    <td>{chat.title || 'New Analysis'}</td>
                    <td>{formatDate(chat.createdAt)}</td>
                    <td>{chat.messages ? chat.messages.length : 0}</td>
                    <td>
                      <Link to={`/chat/${chat._id}`}>
                        <Button variant='light' className='btn-sm'>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
};

export default ChatListScreen;
