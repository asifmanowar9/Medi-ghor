import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listUserChats, createChat } from '../actions/chatActions';
import { formatDistanceToNow } from 'date-fns';

const ChatListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const chatList = useSelector((state) => state.chatList);
  const { loading, error, chats } = chatList;

  const chatCreate = useSelector((state) => state.chatCreate);
  const { success: successCreate, chat: createdChat } = chatCreate;

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

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Test Report Analysis</h1>
        </Col>
        <Col className='text-right'>
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
          {chats.length === 0 ? (
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
                    <td>{chat.title}</td>
                    <td>
                      {formatDistanceToNow(new Date(chat.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td>{chat.messages.length}</td>
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
