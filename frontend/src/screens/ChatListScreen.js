import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Dropdown,
  Modal,
  Table,
  Pagination,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaImage,
  FaClock,
  FaChartLine,
  FaArrowLeft,
  FaComments,
  FaStethoscope,
  FaSync,
} from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listChats, createChat, deleteChat } from '../actions/chatActions';
import './ChatListScreen.css';

const ChatListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Redux state
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const chatList = useSelector((state) => state.chatList) || {};
  const {
    loading,
    error,
    chats: rawChats,
    totalPages = 1,
    stats = {},
  } = chatList;

  // Debug logging
  console.log('ChatList Redux State:', chatList);
  console.log('Raw chats data:', rawChats);
  
  // Debug individual chat messages
  if (Array.isArray(rawChats)) {
    rawChats.forEach((chat, index) => {
      console.log(`Chat ${index + 1} (${chat._id}):`, {
        title: chat.title,
        messagesCount: chat.messages ? chat.messages.length : 0,
        messages: chat.messages,
        createdAt: chat.createdAt
      });
    });
  }

  // Ensure chats is always an array
  const chats = Array.isArray(rawChats) ? rawChats : [];

  const chatCreate = useSelector((state) => state.chatCreate) || {};
  const { loading: loadingCreate, success: successCreate } = chatCreate;

  const chatDelete = useSelector((state) => state.chatDelete) || {};
  const { loading: loadingDelete, success: successDelete } = chatDelete;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Load chats on component mount and refresh periodically
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    dispatch(listChats());
  }, [dispatch, navigate, userInfo, successCreate, successDelete]);

  // Refresh chats when component becomes visible (user returns to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userInfo) {
        dispatch(listChats());
      }
    };

    const handleFocus = () => {
      if (userInfo) {
        dispatch(listChats());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch, userInfo]);

  // Handle create chat
  const handleCreateChat = () => {
    const defaultChatData = {
      title: 'AI Medical Chat',
      description: 'New AI medical conversation',
    };

    console.log('Creating chat with data:', defaultChatData);
    console.log('User info:', userInfo);

    dispatch(createChat(defaultChatData))
      .then((data) => {
        console.log('Chat created successfully:', data);
        if (data && data._id) {
          navigate(`/chat/${data._id}`);
        }
      })
      .catch((error) => {
        console.error('Error creating chat:', error);
      });
  };

  // Handle delete chat
  const handleDeleteChat = () => {
    if (chatToDelete) {
      dispatch(deleteChat(chatToDelete._id));
      setShowDeleteModal(false);
      setChatToDelete(null);
    }
  };

  // Handle refresh chat list
  const handleRefresh = () => {
    dispatch(listChats());
  };

  // Filter chats based on search
  const filteredChats = chats.filter(
    (chat) =>
      !searchTerm ||
      (chat.title &&
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.messages &&
        chat.messages.some(
          (msg) =>
            msg.content &&
            msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  return (
    <Container fluid className='chat-list-container'>
      {/* Header */}
      <Row className='mb-4'>
        <Col>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <Link to='/' className='btn btn-outline-light mb-3'>
                <FaArrowLeft className='me-2' /> Back to Home
              </Link>
              <h1 className='page-title'>
                <FaStethoscope className='me-3' />
                AI Medical Assistant
              </h1>
              <p className='page-subtitle'>
                Chat with AI about your medical questions and reports
              </p>
            </div>
            <div className='d-flex gap-2'>
              <Button
                variant='outline-primary'
                size='lg'
                onClick={handleRefresh}
                disabled={loading}
                className='refresh-btn'
              >
                <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant='primary'
                size='lg'
                onClick={handleCreateChat}
                className='create-btn'
              >
                <FaPlus className='me-2' />
                New Chat
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className='mb-4'>
        <Col md={4}>
          <Card className='stat-card bg-primary'>
            <Card.Body>
              <div className='d-flex align-items-center'>
                <FaComments className='stat-icon' />
                <div>
                  <h3>{chats.length}</h3>
                  <p>Total Chats</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='stat-card bg-success'>
            <Card.Body>
              <div className='d-flex align-items-center'>
                <FaStethoscope className='stat-icon' />
                <div>
                  <h3>
                    {chats.reduce(
                      (total, chat) =>
                        total + (chat.messages ? chat.messages.length : 0),
                      0
                    )}
                  </h3>
                  <p>Total Messages</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='stat-card bg-info'>
            <Card.Body>
              <div className='d-flex align-items-center'>
                <FaClock className='stat-icon' />
                <div>
                  <h3>
                    {
                      chats.filter((chat) => {
                        const today = new Date();
                        const chatDate = new Date(chat.createdAt);
                        return today.toDateString() === chatDate.toDateString();
                      }).length
                    }
                  </h3>
                  <p>Today's Chats</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Simple Search */}
      <Row className='mb-4'>
        <Col>
          <Card className='search-card'>
            <Card.Body>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type='text'
                  placeholder='Search your chats...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chat List */}
      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' variant='primary' size='lg' />
          <p className='mt-3 text-muted'>Loading your chats...</p>
        </div>
      ) : error ? (
        <Alert variant='danger' className='text-center'>
          <FaStethoscope className='me-2' />
          {error}
        </Alert>
      ) : (
        <>
          {filteredChats.length === 0 ? (
            <Card className='empty-state-card text-center'>
              <Card.Body className='py-5'>
                <FaComments className='empty-icon mb-3' />
                <h4>No chats found</h4>
                <p className='text-muted mb-4'>
                  {chats.length === 0
                    ? 'Start your first AI medical conversation.'
                    : 'Try adjusting your search or create a new chat.'}
                </p>
                <Button variant='primary' size='lg' onClick={handleCreateChat}>
                  <FaPlus className='me-2' />
                  Create New Chat
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredChats.map((chat) => (
                <Col key={chat._id} lg={4} md={6} className='mb-4'>
                  <Card className='chat-card h-100'>
                    <Card.Header className='d-flex justify-content-between align-items-center'>
                      <div className='d-flex align-items-center'>
                        <FaStethoscope className='me-2 text-primary' />
                        <div>
                          <h6 style={{ color: 'black' }} className='mb-0'>
                            {chat.title || 'AI Medical Chat'}
                          </h6>
                          <small className='text-black'>
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <Dropdown align='end'>
                        <Dropdown.Toggle variant='link' className='text-muted'>
                          <i className='fas fa-ellipsis-v'></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => navigate(`/chat/${chat._id}`)}
                          >
                            <FaEye className='me-2' /> Open Chat
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className='text-danger'
                            onClick={() => {
                              setChatToDelete(chat);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash className='me-2' /> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Card.Header>

                    <Card.Body>
                      <p className='text-black mb-3'>
                        {chat.messages && chat.messages.length > 0
                          ? chat.messages[
                              chat.messages.length - 1
                            ].content?.substring(0, 100) + '...'
                          : 'No messages yet'}
                      </p>
                    </Card.Body>

                    <Card.Footer>
                      <div className='d-flex justify-content-between align-items-center'>
                        <small className='text-black'>
                          <FaComments className='me-1' />
                          {chat.messages ? chat.messages.length : 0} messages
                        </small>
                        <Button
                          variant='primary'
                          size='sm'
                          onClick={() => navigate(`/chat/${chat._id}`)}
                        >
                          <FaEye className='me-1' /> Open
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className='bg-danger text-white'>
          <Modal.Title>
            <FaTrash className='me-2' />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete "
            {chatToDelete?.title || 'this chat'}"? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={() => {
              if (chatToDelete) {
                dispatch(deleteChat(chatToDelete._id));
                setShowDeleteModal(false);
                setChatToDelete(null);
              }
            }}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <>
                <Spinner size='sm' className='me-2' />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className='me-2' />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ChatListScreen;
